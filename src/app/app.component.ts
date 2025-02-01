import { Component } from '@angular/core';
import { ForceDirectedGraphComponent } from './force-directed-graph/force-directed-graph.component';
import { Sidebar } from 'primeng/sidebar';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ForceDirectedGraphComponent,
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
  showGraph = false;
  menuItems: MenuItem[] = [
    {
      label: 'Graphs',
      items: [
        {
          label: 'Force Directed Graph',
          icon: 'pi pi-chart-network',
          command: () => {
            this.showGraph = true;
            this.sidebarVisible = false;
          }
        }
      ]
    }
  ];
}
