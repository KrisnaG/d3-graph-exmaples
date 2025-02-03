import { Component } from '@angular/core';
import { D3ForceDirectedGraphComponent } from './d3-force-directed-graph/d3-force-directed-graph.component';
import { P5ForceDirectedGraphComponent } from './p5-force-directed-graph/p5-force-directed-graph.component';
import { Sidebar } from 'primeng/sidebar';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    D3ForceDirectedGraphComponent,
    P5ForceDirectedGraphComponent,
    Sidebar,
    Button,
    Menu,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  sidebarVisible = false;
  showGraph = {
    "d3": false,
    "p5": false,
  };


  menuItems: MenuItem[] = [
    {
      label: 'Graphs',
      items: [
        {
          label: 'D3 Force Directed Graph',
          icon: 'pi pi-chart-network',
          command: () => {
            this.showGraph.d3 = true;
            this.showGraph.p5 = false;
            this.sidebarVisible = false;
          }
        },
        {
          label: 'P5 Force Directed Graph',
          icon: 'pi pi-chart-network',
          command: () => {
            this.showGraph.d3 = false;
            this.showGraph.p5 = true;
            this.sidebarVisible = false;
          }
        }
      ]
    }
  ];
}
