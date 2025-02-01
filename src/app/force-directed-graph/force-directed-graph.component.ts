import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-force-directed-graph',
  standalone: true,
  imports: [],
  templateUrl: './force-directed-graph.component.html',
  styleUrl: './force-directed-graph.component.scss'
})
export class ForceDirectedGraphComponent implements OnInit {
  private svg: any;
  private simulation: any;
  
  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.createGraph();
  }

  private createGraph() {
    // Sample data with more nodes and links, including duplicate connections
    const nodes = [
      { id: 1, name: 'Node 1 with a very long description', shape: 'circle', showText: true },
      { id: 2, name: 'Node 2 which also has quite a detailed explanation', shape: 'rectangle', showText: true },
      { id: 3, name: 'Node 3 with lots of information', shape: 'circle', showText: true },
      { id: 4, name: 'Node 4 and its description', shape: 'rectangle', showText: true },
      { id: 5, name: 'Node 5 containing important data', shape: 'circle', showText: true },
      { id: 6, name: 'Node 6 with additional context', shape: 'rectangle', showText: true },
      { id: 7, name: 'Node 7 explaining the process', shape: 'circle', showText: true },
      { id: 8, name: 'Node 8 with technical details', shape: 'rectangle', showText: true },
      { id: 9, name: 'Node 9 showing results', shape: 'circle', showText: true },
      { id: 10, name: 'Node 10 with conclusions', shape: 'rectangle', showText: true }
    ];

    const links = [
      { source: 1, target: 2 },
      { source: 2, target: 1 }, // Duplicate link
      { source: 2, target: 3 },
      { source: 3, target: 4 },
      { source: 4, target: 1 },
      { source: 5, target: 1 },
      { source: 5, target: 6 },
      { source: 6, target: 7 },
      { source: 7, target: 8 },
      { source: 8, target: 9 },
      { source: 9, target: 10 },
      { source: 10, target: 5 },
      { source: 2, target: 7 },
      { source: 3, target: 9 },
      { source: 4, target: 6 },
      { source: 1, target: 8 },
      { source: 5, target: 1 }, // Duplicate link
    ];

    // Create SVG container with zoom support
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('width', 600)
      .attr('height', 400);

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

    // Create force simulation
    this.simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(300, 200));

    // Group links by source-target pairs AFTER simulation is created
    const linkGroups = new Map();
    links.forEach(link => {
      // Access the source and target objects that the simulation created
      const sourceId = typeof link.source === 'object' ? (link.source as {id: number}).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as {id: number}).id : link.target;
      
      // Create a consistent key regardless of direction
      const key = [Math.min(sourceId, targetId), Math.max(sourceId, targetId)].join('-');
      
      if (!linkGroups.has(key)) {
        linkGroups.set(key, []);
      }
      linkGroups.get(key).push(link);
    });

    // Draw links
    const link = container
      .selectAll('path')
      .data(links)
      .join('path')
      .style('stroke', '#999')
      .style('stroke-width', 1)
      .style('fill', 'none');

    // Create node groups
    const nodeGroup = container
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', this.dragStarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragEnded.bind(this)));

    // Add shapes to nodes
    nodeGroup.each(function(this: d3.BaseType, d: any) {
      const element = d3.select(this);
      if (d.shape === 'circle') {
        element.append('circle')
          .attr('r', 30)
          .style('fill', '#69b3a2');
        
        element.append('clipPath')
          .attr('id', (d: any) => `clip-${d.id}`)
          .append('circle')
          .attr('r', 28);
      } else {
        element.append('rect')
          .attr('width', 60)
          .attr('height', 60)
          .attr('x', -30)
          .attr('y', -30)
          .style('fill', '#69b3a2');
        
        element.append('clipPath')
          .attr('id', (d: any) => `clip-${d.id}`)
          .append('rect')
          .attr('width', 56)
          .attr('height', 56)
          .attr('x', -28)
          .attr('y', -28);
      }
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
      link.attr('d', (d: any) => {
        // Create key from the actual source and target objects
        const key = [
          Math.min(d.source.id, d.target.id),
          Math.max(d.source.id, d.target.id)
        ].join('-');
        
        const links = linkGroups.get(key);
        
        if (links && links.length > 1) {
          // Calculate curve for multiple links
          const index = links.indexOf(d);
          const total = links.length;
          const curveOffset = 30 * (index - (total - 1) / 2);
          
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const midX = (d.source.x + d.target.x) / 2;
          const midY = (d.source.y + d.target.y) / 2;
          
          const length = Math.sqrt(dx * dx + dy * dy);
          const normalX = -dy / length;
          const normalY = dx / length;
          
          const cpX = midX + normalX * curveOffset;
          const cpY = midY + normalY * curveOffset;
          
          return `M${d.source.x},${d.source.y} Q${cpX},${cpY} ${d.target.x},${d.target.y}`;
        } else {
          // Straight line for single links
          return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
        }
      });

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  private updateLabels(scale: number) {
    // Calculate visible width based on node size and zoom
    const nodeRadius = 28; // Using the clip path radius
    const visibleWidth = nodeRadius * 2; // Full diameter
    const charsPerPixel = 0.3; // Adjusted characters per pixel
    const maxChars = Math.floor(visibleWidth * charsPerPixel * scale);
    
    this.svg.selectAll('text')
      .each(function(this: d3.BaseType, d: any) {
        const text = d.name;
        const truncatedText = text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
        
        // Split text into multiple lines if needed
        const element = d3.select(this);
        element.selectAll('*').remove(); // Clear existing content
        
        const words = truncatedText.split(' ');
        let lines = [''];
        let lineNumber = 0;
        
        words.forEach((word: string) => {
          const testLine = lines[lineNumber] + (lines[lineNumber] ? ' ' : '') + word;
          if (testLine.length * 6 > visibleWidth * scale) { // 6 pixels per character approximation
            lineNumber++;
            lines[lineNumber] = word;
          } else {
            lines[lineNumber] = testLine;
          }
        });

        // Limit to 3 lines maximum
        lines = lines.slice(0, 3);
        if (lines.length === 3 && words.length > lines.join(' ').split(' ').length) {
          lines[2] = lines[2].replace(/\s*\S*$/, '...');
        }
        
        // Add lines as tspans
        lines.forEach((line, i) => {
          element.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? `-${(lines.length - 1) * 0.6}em` : '1.2em')
            .text(line);
        });
      });
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
}
