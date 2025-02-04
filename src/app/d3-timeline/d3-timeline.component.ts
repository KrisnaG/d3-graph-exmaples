import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';

interface TimelineEvent {
  date: Date;
  title: string;
  description: string;
}

@Component({
  selector: 'app-d3-timeline',
  standalone: true,
  template: '<div class="timeline-container"></div>',
  styles: [`
    .timeline-container {
      width: 100%;
      height: 100%;
      min-height: 300px;
      overflow: visible;
    }
    :host ::ng-deep {
      .timeline-line {
        stroke: #ccc;
        stroke-width: 2px;
      }
      .timeline-point {
        fill: var(--primary-color);
        cursor: pointer;
      }
      .timeline-label {
        font-size: 12px;
        fill: var(--text-color);
      }
      .timeline-description {
        font-size: 14px;
        fill: var(--text-color);
      }
      .event-box {
        fill: white;
        stroke: #ccc;
        stroke-width: 1px;
      }
      .connector-line {
        stroke: #ccc;
        stroke-width: 1px;
      }
    }
  `]
})
export class D3TimelineComponent implements OnInit {
  private sampleData: TimelineEvent[] = [
    {
      date: new Date('2024-01-01'),
      title: 'Event 1',
      description: 'Description for Event 1'
    },
    {
      date: new Date('2024-01-01'),
      title: 'Event 2',
      description: 'Description for Event 2'
    },
    {
      date: new Date('2024-01-02'),
      title: 'Event 3',
      description: 'Description for Event 3'
    },
    {
      date: new Date('2024-03-30'),
      title: 'Event 4',
      description: 'Description for Event 3'
    },
    {
      date: new Date('2023-12-31'),
      title: 'Event 5',
      description: 'Description for Event 3'
    }
  ];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.createTimeline();
  }

  private createTimeline() {
    const margin = { top: 80, right: 50, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const baseHeight = 300;
    
    // Group events by date to find maximum stack height
    const eventsByDate = d3.group(this.sampleData, d => d.date.getTime());
    const maxStackSize = Math.max(...Array.from(eventsByDate.values()).map(events => events.length));
    const stackSpacing = 80; // Increased spacing between stacked events
    
    // Adjust height based on maximum stack size, ensuring enough space for boxes and connectors
    const height = Math.max(baseHeight, (maxStackSize * stackSpacing + 160)) - margin.top - margin.bottom;

    const stackedData = Array.from(eventsByDate.entries()).flatMap(([timestamp, events]) => 
      events.map((event, index) => ({
        ...event,
        stackIndex: index,
        totalInStack: events.length
      }))
    );

    // Update SVG container size
    const svg = d3.select(this.elementRef.nativeElement.querySelector('.timeline-container'))
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add padding to the domain
    const timelinePadding = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds
    const domainStart = new Date(Math.min(...this.sampleData.map(e => e.date.getTime())) - timelinePadding);
    const domainEnd = new Date(Math.max(...this.sampleData.map(e => e.date.getTime())) + timelinePadding);

    // Update xScale with new domain
    const xScale = d3.scaleTime()
      .domain([domainStart, domainEnd])
      .range([margin.left, width - margin.right]);

    // Create timeline line with extended domain
    svg.append('line')
      .attr('class', 'timeline-line')
      .attr('x1', margin.left)
      .attr('y1', height / 2)
      .attr('x2', width - margin.right)
      .attr('y2', height / 2);

    // Add events
    const events = svg.selectAll('.event')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'event')
      .attr('transform', d => {
        const x = xScale(d.date);
        // Calculate vertical offset from the timeline
        // Adjust the multiplier (40) to control spacing between stacked events
        const yOffset = (d.stackIndex - (d.totalInStack - 1) / 2) * 40;
        // Keep the event point on the timeline by separating the point and box positioning
        return `translate(${x},${height/2})`;
      });

    // Add connector lines
    events.append('line')
      .attr('class', 'connector-line')
      .attr('x1', 0)
      .attr('y1', 0) // Start from the timeline point
      .attr('x2', 0)
      .attr('y2', d => -40 - (d.stackIndex * 50)); // Adjust end point based on stack position

    // Add event boxes with adjusted positioning
    events.append('rect')
      .attr('class', 'event-box')
      .attr('x', 0)
      .attr('y', d => -80 - (d.stackIndex * 50)) // Position box above the connector line
      .attr('width', 120)
      .attr('height', 40)
      .attr('rx', 0) // Added rounded corners
      .attr('ry', 0);

    // Add points (these will stay on the timeline)
    events.append('circle')
      .attr('class', 'timeline-point')
      .attr('r', 6);

    // Add titles inside boxes with adjusted positioning
    events.append('text')
      .attr('class', 'timeline-label')
      .attr('x', 20)
      .attr('y', d => -55 - (d.stackIndex * 50)) // Position text inside box
      .attr('text-anchor', 'middle')
      .text(d => d.title);
  }
}