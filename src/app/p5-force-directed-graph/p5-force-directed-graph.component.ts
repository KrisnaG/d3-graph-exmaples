import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import p5 from 'p5';
import { GraphDataService, Node, Link } from '../services/graph-data.service';

@Component({
  selector: 'app-p5-force-directed-graph',
  templateUrl: './p5-force-directed-graph.component.html',
  styleUrl: './p5-force-directed-graph.component.scss'
})
export class P5ForceDirectedGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef;
  private p5: any;
  private nodes: any[] = [];
  private links: any[] = [];
  private selectedNode: any = null;
  private highlightedNode: any = null;
  private zoom = 1;
  private offsetX = 0;
  private offsetY = 0;
  private containerWidth = 0;
  private containerHeight = 0;

  constructor(private graphDataService: GraphDataService) {
    // Set up resize observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.containerWidth = entry.contentRect.width;
        this.containerHeight = entry.contentRect.height;
        if (this.p5) {
          this.p5.resizeCanvas(this.containerWidth, this.containerHeight);
          this.centerGraph(); // Re-center after resize
        }
      }
    });

    // Start observing after view init
    setTimeout(() => {
      if (this.canvasRef?.nativeElement) {
        resizeObserver.observe(this.canvasRef.nativeElement);
      }
    }, 0);
  }

  private centerGraph() {
    if (!this.nodes.length) return;

    // Calculate the bounds of the graph
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this.nodes.forEach(node => {
      if (isFinite(node.x) && isFinite(node.y)) {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
      }
    });

    // Guard against invalid values
    if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }

    // Calculate the center of the graph
    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;

    // Calculate the required offset to center the graph
    const containerCenterX = this.containerWidth / 2;
    const containerCenterY = this.containerHeight / 2;

    // Guard against NaN values
    const newOffsetX = containerCenterX - graphCenterX * this.zoom;
    const newOffsetY = containerCenterY - graphCenterY * this.zoom;

    this.offsetX = isFinite(newOffsetX) ? newOffsetX : 0;
    this.offsetY = isFinite(newOffsetY) ? newOffsetY : 0;
  }

  ngOnInit() {
    this.graphDataService.getNodes().subscribe(nodes => {
      this.nodes = nodes.map(node => ({
        ...node,
        x: Math.random() * window.innerWidth - window.innerWidth/2,
        y: Math.random() * window.innerHeight - window.innerHeight/2,
        vx: 0,
        vy: 0
      }));
      // Center the graph after nodes are loaded
      setTimeout(() => this.centerGraph(), 100);
    });

    this.graphDataService.getLinks().subscribe(links => {
      this.links = links;
    });
  }

  ngAfterViewInit() {
    // Wait for the container to be sized
    setTimeout(() => {
      this.createCanvas();
    }, 0);
  }

  private createCanvas() {
    const sketch = (p: any) => {
      p.setup = () => {
        // Get initial container size
        this.containerWidth = this.canvasRef.nativeElement.offsetWidth;
        this.containerHeight = this.canvasRef.nativeElement.offsetHeight;
        const canvas = p.createCanvas(this.containerWidth, this.containerHeight);
        canvas.style('display', 'block'); // Ensure canvas displays properly
      };

      p.draw = () => {
        // Get background color from theme
        const computedStyle = getComputedStyle(document.documentElement);
        const backgroundColor = computedStyle.getPropertyValue('--p-content-background').trim() || '#ffffff';
        p.background(backgroundColor || 240);
        
        // Apply zoom and pan transformation
        p.translate(p.width/2 + this.offsetX, p.height/2 + this.offsetY);
        p.scale(this.zoom);
        p.translate(-p.width/2, -p.height/2);

        this.updatePositions(p);
        this.drawLinks(p);
        this.drawNodes(p);

        // Debug info
        p.push();
        p.resetMatrix(); // Reset transformations for debug text
        p.fill(0);
        p.noStroke();
        p.textSize(12);
        p.text(`Nodes: ${this.nodes.length}, Links: ${this.links.length}`, 10, 20);
        p.text(`Canvas: ${this.containerWidth}x${this.containerHeight}`, 10, 40);
        p.text(`Zoom: ${this.zoom.toFixed(2)}, Offset: ${this.offsetX.toFixed(0)},${this.offsetY.toFixed(0)}`, 10, 60);
        p.pop();
      };

      // Add key handler for centering
      p.keyPressed = () => {
        if (p.key === 'c' || p.key === 'C') {
          this.centerGraph();
        }
      };

      p.mouseWheel = (event: any) => {
        // Zoom with mouse wheel
        const zoomSensitivity = 0.001;
        const newZoom = this.zoom * (1 - event.delta * zoomSensitivity);
        this.zoom = p.constrain(newZoom, 0.1, 5);
        return false; // Prevent default scrolling
      };

      p.mousePressed = () => {
        // Transform mouse coordinates to account for zoom and pan
        const mouseX = (p.mouseX - p.width/2 - this.offsetX) / this.zoom + p.width/2;
        const mouseY = (p.mouseY - p.height/2 - this.offsetY) / this.zoom + p.height/2;
        
        const clickedNode = this.nodes.find(node => {
          const d = p.dist(mouseX, mouseY, node.x, node.y);
          return d < 20;
        });

        if (clickedNode) {
          if (p.mouseButton === p.LEFT) {
            if (this.highlightedNode === clickedNode) {
              this.highlightedNode = null; // Unhighlight if already highlighted
            } else {
              this.highlightedNode = clickedNode; // Highlight new node
            }
          }
          this.selectedNode = clickedNode; // For dragging
          this.selectedNode.vx = 0;
          this.selectedNode.vy = 0;
        }
      };

      p.mouseDragged = () => {
        if (this.selectedNode) {
          // Transform mouse coordinates for node dragging
          const dx = p.mouseX - p.pmouseX;
          const dy = p.mouseY - p.pmouseY;
          this.selectedNode.x += dx / this.zoom;
          this.selectedNode.y += dy / this.zoom;
        } else {
          // Pan the canvas when no node is selected
          this.offsetX += p.mouseX - p.pmouseX;
          this.offsetY += p.mouseY - p.pmouseY;
        }
      };

      p.mouseReleased = () => {
        this.selectedNode = null;
      };
    };

    this.p5 = new p5(sketch, this.canvasRef.nativeElement);
  }

  private drawNodes(p: any) {
    this.nodes.forEach(node => {
      p.push();
      p.translate(node.x, node.y);
      
      // Highlight selected node
      if (node === this.highlightedNode) {
        p.fill(255, 255, 0); // Yellow highlight
        p.stroke(255, 150, 0); // Orange border
        p.strokeWeight(2);
      } else {
        const computedStyle = getComputedStyle(document.documentElement);
        const backgroundColor = computedStyle.getPropertyValue('--p-primary-color').trim() || '#ffffff';
        p.fill(backgroundColor);
        p.stroke(0);
        p.strokeWeight(1);
      }

      // Calculate text size based on zoom level (if you implement zoom later)
      const baseTextSize = 12;
      const textSize = baseTextSize;
      
      // Get node dimensions
      let width = 0;
      let height = 0;
      
      // Draw different shapes based on node.shape
      switch (node.shape) {
        case 'circle':
          width = height = 40;
          p.ellipse(0, 0, width, height);
          break;
        case 'rectangle':
          width = 60;
          height = 40;
          p.rect(-width/2, -height/2, width, height);
          break;
        case 'square':
          width = height = 40;
          p.rect(-width/2, -height/2, width, height);
          break;
      }

      if (node.showText) {
        p.fill(0);  // Black text
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(textSize);
        
        // Calculate how much text can fit
        const padding = 4;
        const maxWidth = width - padding * 2;
        const maxHeight = height - padding * 2;
        
        // Break text into words
        const words = node.name.split(' ');
        let line = '';
        let lines = [];
        let currentHeight = 0;
        
        for (let word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          const testWidth = p.textWidth(testLine);
          
          if (testWidth > maxWidth) {
            if (line) {
              lines.push(line);
              currentHeight += textSize;
              if (currentHeight > maxHeight) break;
              line = word;
            } else {
              line = word;
            }
          } else {
            line = testLine;
          }
        }
        if (line && currentHeight + textSize <= maxHeight) {
          lines.push(line);
        }
        
        // Draw text lines
        const totalTextHeight = lines.length * textSize;
        const startY = -totalTextHeight/2 + textSize/2;
        
        lines.forEach((line, i) => {
          p.text(line, 0, startY + i * textSize);
        });
      }
      
      p.pop();
    });
  }

  private drawLinks(p: any) {
    // Create a map to count parallel links
    const linkCounts = new Map();
    this.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const linkKey = [Math.min(sourceId, targetId), Math.max(sourceId, targetId)].join('-');
      linkCounts.set(linkKey, (linkCounts.get(linkKey) || 0) + 1);
    });

    this.links.forEach(link => {
      const source = this.nodes.find(n => n.id === (typeof link.source === 'object' ? link.source.id : link.source));
      const target = this.nodes.find(n => n.id === (typeof link.target === 'object' ? link.target.id : link.target));
      
      if (source && target) {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const linkKey = [Math.min(sourceId, targetId), Math.max(sourceId, targetId)].join('-');
        const count = linkCounts.get(linkKey);

        p.stroke(150);
        p.strokeWeight(1);
        
        if (count > 1) {
          // Draw curved line for parallel links
          p.noFill();
          p.beginShape();
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const norm = Math.sqrt(dx * dx + dy * dy);
          const offset = 30 * (count > 2 ? 1.5 : 1); // Increase curve for more than 2 parallel links
          
          const controlX = midX - dy * offset / norm;
          const controlY = midY + dx * offset / norm;
          
          p.vertex(source.x, source.y);
          p.quadraticVertex(controlX, controlY, target.x, target.y);
          p.endShape();
        } else {
          // Draw straight line for single links
          p.line(source.x, source.y, target.x, target.y);
        }
      }
    });
  }

  private updatePositions(p: any) {
    const k = 0.05; // Reduced spring constant
    const repulsionStrength = 8000; // Increased repulsion
    const springLength = 200; // Increased desired spring length

    this.nodes.forEach(node1 => {
      if (node1 === this.selectedNode) return;

      // Initialize forces for this node
      let fx = 0;
      let fy = 0;

      // Repulsion between nodes (Coulomb's law)
      this.nodes.forEach(node2 => {
        if (node1 !== node2) {
          const dx = node1.x - node2.x;
          const dy = node1.y - node2.y;
          const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = repulsionStrength / (distance * distance);
          
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }
      });

      // Attraction along links (Hooke's law)
      this.links.forEach(link => {
        const source = typeof link.source === 'object' ? link.source.id : link.source;
        const target = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (node1.id === source || node1.id === target) {
          const other = this.nodes.find(n => n.id === (node1.id === source ? target : source));
          if (other) {
            const dx = node1.x - other.x;
            const dy = node1.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = k * (distance - springLength * link.weight);
            
            fx -= (dx / distance) * force;
            fy -= (dy / distance) * force;
          }
        }
      });

      // Update velocity with forces
      node1.vx = (node1.vx + fx) * 0.5; // Damping factor of 0.5
      node1.vy = (node1.vy + fy) * 0.5;

      // Update position
      node1.x += node1.vx;
      node1.y += node1.vy;
    });
  }
}
