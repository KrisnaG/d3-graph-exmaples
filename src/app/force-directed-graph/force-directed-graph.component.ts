import { Component, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import * as d3 from 'd3';
import { LinkManager } from '../utils/link-manager';
import { LabelManager } from '../utils/label-manager';
import { ShapeFactory } from '../utils/shape-factory';
import { GraphDataService, Node, Link } from '../service/graph-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-force-directed-graph',
  standalone: true,
  imports: [],
  templateUrl: './force-directed-graph.component.html',
  styleUrl: './force-directed-graph.component.scss'
})
export class ForceDirectedGraphComponent implements OnInit, OnDestroy {
  private svg: any;
  private simulation: any;
  private linkManager!: LinkManager;
  private labelManager: LabelManager = new LabelManager();
  private selectedNode: any = null;
  private subscriptions: Subscription = new Subscription();
  private resizeTimeout: any;
  
  constructor(
    private elementRef: ElementRef,
    private graphDataService: GraphDataService
  ) {}

  @HostListener('window:resize')
  onResize() {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout(() => {
      this.updateGraphDimensions();
    }, 250); // Wait for 250ms after last resize event
  }

  private updateGraphDimensions() {
    if (!this.svg || !this.simulation) return;

    // Get new dimensions
    const width = this.elementRef.nativeElement.offsetWidth;
    const height = this.elementRef.nativeElement.offsetHeight;

    // Update SVG dimensions
    this.svg
      .style('width', '100%')
      .style('height', '100%');

    // Update force simulation center
    this.simulation
      .force('center', d3.forceCenter(width / 2, height / 2))
      .alpha(0.3) // Set the alpha to restart the simulation
      .restart();
  }

  ngOnInit() {
    this.subscriptions.add(
      this.graphDataService.getNodes().subscribe(nodes => {
        this.subscriptions.add(
          this.graphDataService.getLinks().subscribe(links => {
            this.createGraph(nodes, links);
          })
        );
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  private createGraph(nodes: Node[], links: Link[]) {
    // Clear existing graph if any
    if (this.svg) {
      d3.select(this.elementRef.nativeElement).selectAll('*').remove();
    }

    // Update SVG container to fill parent element
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .style('width', '100%')
      .style('height', '100%')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Get the actual dimensions of the container
    const width = this.elementRef.nativeElement.offsetWidth;
    const height = this.elementRef.nativeElement.offsetHeight;

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        this.updateLabels(event.transform.k);
      });

    this.svg.call(zoom);

    // Create a container group for all elements
    const container = this.svg.append('g');

    // Update the force simulation with weighted link distances
    this.simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink<any, any>(links)
        .id((d: any) => d.id)
        .distance((d: any) => d.weight * 100)
      )
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2));

    this.linkManager = new LinkManager(links);

    // Update link styling to reflect weight
    const link = container
      .selectAll('path')
      .data(links)
      .join('path')
      .style('stroke', '#999')
      .style('stroke-width', (d: any) => 1 / Math.max(1, d.weight))
      .style('fill', 'none');

    // Create node groups
    const nodeGroup = container
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', this.dragStarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragEnded.bind(this)))
      .on('click', (event: MouseEvent, d: any) => this.handleNodeClick(event, d));

    // Add shapes to nodes
    nodeGroup.each(function(this: d3.BaseType, d: any) {
      const element = d3.select(this);
      const nodeShape = ShapeFactory.createShape(d.shape);
      
      // Draw the main shape
      nodeShape.draw(element, 30);
      
      // Create clip path
      element.append('clipPath')
        .attr('id', (d: any) => `clip-${d.id}`)
        .call(selection => nodeShape.createClipPath(selection, 30));
    });

    // Add text labels
    nodeGroup
      .filter((d: any) => d.showText)
      .append('text')
      .attr('clip-path', (d: any) => `url(#clip-${d.id})`)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', '#333')
      .style('font-size', '10px')
      .style('pointer-events', 'none');

    // Initial text update
    this.updateLabels(1);

    // Update positions on each tick
    this.simulation.on('tick', () => {
      link.attr('d', (d: any) => this.linkManager.getPath(d));
      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  private updateLabels(scale: number) {
    this.labelManager.updateLabels(this.svg.selectAll('text'), scale);
  }

  private dragStarted(this: ForceDirectedGraphComponent, event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private dragged(this: ForceDirectedGraphComponent, event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragEnded(this: ForceDirectedGraphComponent, event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  private handleNodeClick(event: MouseEvent, d: any) {
    const element = d3.select(event.currentTarget as Element);
    const nodeShape = ShapeFactory.createShape(d.shape);

    if (this.selectedNode === d) {
      nodeShape.unhighlight(element);
      this.selectedNode = null;
    } else {
      // Unhighlight previous selection if exists
      if (this.selectedNode) {
        const prevElement = this.svg.select(`g[data-id="${this.selectedNode.id}"]`);
        const prevShape = ShapeFactory.createShape(this.selectedNode.shape);
        prevShape.unhighlight(prevElement);
      }
      
      // Highlight new selection
      nodeShape.highlight(element);
      this.selectedNode = d;
    }
  }
}
