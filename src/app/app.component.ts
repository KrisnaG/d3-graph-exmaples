import { Component } from '@angular/core';
import { ForceDirectedGraphComponent } from './force-directed-graph/force-directed-graph.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ForceDirectedGraphComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'd3-graph-examples';
}
