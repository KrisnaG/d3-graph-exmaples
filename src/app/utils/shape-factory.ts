// Add these interfaces/classes before the @Component decorator
export interface NodeShape {
  draw(element: d3.Selection<any, any, any, any>, size: number): void;
  createClipPath(element: d3.Selection<any, any, any, any>, size: number): void;
  highlight(element: d3.Selection<any, any, any, any>): void;
  unhighlight(element: d3.Selection<any, any, any, any>): void;
}

export class CircleShape implements NodeShape {
  draw(element: d3.Selection<any, any, any, any>, size: number): void {
    element.append('circle')
      .attr('r', size)
      .style('fill', '#69b3a2');
  }

  createClipPath(element: d3.Selection<any, any, any, any>, size: number): void {
    element.append('circle')
      .attr('r', size - 2);
  }

  highlight(element: d3.Selection<any, any, any, any>): void {
    element.select('circle')
      .style('stroke', '#ff4444')
      .style('stroke-width', '3px');
  }

  unhighlight(element: d3.Selection<any, any, any, any>): void {
    element.select('circle')
      .style('stroke', null)
      .style('stroke-width', null);
  }
}

export class RectangleShape implements NodeShape {
  draw(element: d3.Selection<any, any, any, any>, size: number): void {
    element.append('rect')
      .attr('width', size * 2.5)  // Make it wider than tall
      .attr('height', size * 1.5)
      .attr('x', -size * 1.25)    // Center horizontally
      .attr('y', -size * 0.75)    // Center vertically
      .style('fill', '#69b3a2')
      .style('rx', '5');
  }

  createClipPath(element: d3.Selection<any, any, any, any>, size: number): void {
    element.append('rect')
      .attr('width', (size * 2.5) - 4)
      .attr('height', (size * 1.5) - 4)
      .attr('x', -(size * 1.25) + 2)
      .attr('y', -(size * 0.75) + 2);
  }

  highlight(element: d3.Selection<any, any, any, any>): void {
    element.select('rect')
      .style('stroke', '#ff4444')
      .style('stroke-width', '3px');
  }

  unhighlight(element: d3.Selection<any, any, any, any>): void {
    element.select('rect')
      .style('stroke', null)
      .style('stroke-width', null);
  }
}

export class SquareShape implements NodeShape {
  draw(element: d3.Selection<any, any, any, any>, size: number): void {
    element.append('rect')
      .attr('width', size * 2)
      .attr('height', size * 2)
      .attr('x', -size)
      .attr('y', -size)
      .style('fill', '#69b3a2');
  }

  createClipPath(element: d3.Selection<any, any, any, any>, size: number): void {
    element.append('rect')
      .attr('width', (size - 2) * 2)
      .attr('height', (size - 2) * 2)
      .attr('x', -(size - 2))
      .attr('y', -(size - 2));
  }

  highlight(element: d3.Selection<any, any, any, any>): void {
    element.select('rect')
      .style('stroke', '#ff4444')
      .style('stroke-width', '3px');
  }

  unhighlight(element: d3.Selection<any, any, any, any>): void {
    element.select('rect')
      .style('stroke', null)
      .style('stroke-width', null);
  }
}

export class ShapeFactory {
  static createShape(shape: string): NodeShape {
    switch (shape.toLowerCase()) {
      case 'circle':
        return new CircleShape();
      case 'rectangle':
        return new RectangleShape();
      case 'square':
        return new SquareShape();
      default:
        return new CircleShape(); // default to circle
    }
  }
}
