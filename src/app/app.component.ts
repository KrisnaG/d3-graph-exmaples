import { Component } from '@angular/core';
import { D3ForceDirectedGraphComponent } from './d3-force-directed-graph/d3-force-directed-graph.component';
import { P5ForceDirectedGraphComponent } from './p5-force-directed-graph/p5-force-directed-graph.component';
import { Sidebar } from 'primeng/sidebar';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { D3TimelineComponent } from './d3-timeline/d3-timeline.component';
import { TimelineJSComponent } from './timeline-js/timeline-js.component';

type GraphType = 'd3' | 'p5' | 'd3-timeline' | 'timeline-js' | null;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    D3ForceDirectedGraphComponent,
    P5ForceDirectedGraphComponent,
    Sidebar,
    Button,
    Menu,
    CommonModule,
    D3TimelineComponent,
    TimelineJSComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  sidebarVisible = false;
  activeGraph: GraphType = null;

  menuItems: MenuItem[] = [
    {
      label: 'Graphs',
      items: [
        {
          label: 'D3 Force Directed Graph',
          icon: 'pi pi-chart-scatter',
          command: () => this.showGraph('d3')
        },
        {
          label: 'P5 Force Directed Graph',
          icon: 'pi pi-chart-scatter',
          command: () => this.showGraph('p5')
        },
        {
          label: 'D3 Timeline',
          icon: 'pi pi-calendar',
          command: () => this.showGraph('d3-timeline')
        },
        {
          label: 'TimelineJS',
          icon: 'pi pi-calendar',
          command: () => this.showGraph('timeline-js')
        }
      ]
    }
  ];

  showGraph(type: GraphType) {
    this.activeGraph = type;
    this.sidebarVisible = false;
  }
}
