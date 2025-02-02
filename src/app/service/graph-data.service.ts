import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Node {
  id: number;
  name: string;
  shape: 'circle' | 'rectangle' | 'square';
  showText: boolean;
}

export interface Link {
  source: { id: number } | number;
  target: { id: number } | number;
  weight: number;
}

@Injectable({
  providedIn: 'root'
})
export class GraphDataService {
  private nodes: Node[] = [
    { id: 1, name: 'Node 1 with a very long description', shape: 'circle', showText: true },
    { id: 2, name: 'Node 2 which also has quite a detailed explanation', shape: 'rectangle', showText: true },
    { id: 3, name: 'Node 3 with lots of information', shape: 'square', showText: true },
    { id: 4, name: 'Node 4 and its description', shape: 'circle', showText: true },
    { id: 5, name: 'Node 5 containing important data', shape: 'rectangle', showText: true },
    { id: 6, name: 'Node 6 with additional context', shape: 'square', showText: true },
    { id: 7, name: 'Node 7 explaining the process', shape: 'circle', showText: true },
    { id: 8, name: 'Node 8 with technical details', shape: 'rectangle', showText: true },
    { id: 9, name: 'Node 9 showing results', shape: 'square', showText: true },
    { id: 10, name: 'Node 10 with conclusions', shape: 'circle', showText: true }
  ];

  private links: Link[] = [
    { source: 1, target: 2, weight: 1 },    // Normal length
    { source: 2, target: 3, weight: 2 },    // Double length
    { source: 3, target: 4, weight: 0.5 },  // Half length
    { source: 4, target: 1, weight: 1.5 },  // 1.5x length
    { source: 5, target: 1, weight: 1 },
    { source: 5, target: 6, weight: 2 },
    { source: 6, target: 7, weight: 0.7 },
    { source: 7, target: 8, weight: 1 },
    { source: 8, target: 9, weight: 1.2 },
    { source: 9, target: 10, weight: 0.8 },
    { source: 10, target: 5, weight: 1 },
    { source: 2, target: 7, weight: 1.5 },
    { source: 3, target: 9, weight: 5 },
    { source: 4, target: 6, weight: 0.5 },
    { source: 1, target: 8, weight: 1 },
    { source: 5, target: 1, weight: 1 }
  ];

  private nodesSubject = new BehaviorSubject<Node[]>(this.nodes);
  private linksSubject = new BehaviorSubject<Link[]>(this.links);

  constructor() {}

  getNodes(): Observable<Node[]> {
    return this.nodesSubject.asObservable();
  }

  getLinks(): Observable<Link[]> {
    return this.linksSubject.asObservable();
  }

  updateNode(node: Node) {
    const index = this.nodes.findIndex(n => n.id === node.id);
    if (index !== -1) {
      this.nodes[index] = { ...node };
      this.nodesSubject.next([...this.nodes]);
    }
  }

  updateLink(link: Link) {
    const index = this.links.findIndex(l => 
      l.source === link.source && l.target === link.target
    );
    if (index !== -1) {
      this.links[index] = { ...link };
      this.linksSubject.next([...this.links]);
    }
  }

  addNode(node: Node) {
    this.nodes.push(node);
    this.nodesSubject.next([...this.nodes]);
  }

  addLink(link: Link) {
    this.links.push(link);
    this.linksSubject.next([...this.links]);
  }

  removeNode(id: number) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    this.links = this.links.filter(l => 
      l.source !== id && l.target !== id
    );
    this.nodesSubject.next([...this.nodes]);
    this.linksSubject.next([...this.links]);
  }

  removeLink(source: number, target: number) {
    this.links = this.links.filter(l => 
      !(l.source === source && l.target === target)
    );
    this.linksSubject.next([...this.links]);
  }
}