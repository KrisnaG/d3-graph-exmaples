import { Link } from '../service/graph-data.service';

import { SimulationLinkDatum, SimulationNodeDatum } from 'd3';

type SimulationNode = SimulationNodeDatum & {
  id: number;
  x?: number;
  y?: number;
};

interface LinkData extends SimulationLinkDatum<SimulationNodeDatum> {
  id: number;
  source: NodeData;
  target: NodeData;
  weight: number;
}

interface NodeData extends SimulationNodeDatum {
  id: number;
  x?: number;
  y?: number;
}

export class LinkManager {
  private linkGroups = new Map<string, LinkData[]>();

  constructor(private links: Link[]) {
    this.groupLinks(this.links);
  }

  private groupLinks(links: Link[]): void {
    links.forEach(link => {
      const sourceId = typeof link.source === 'number' ? link.source : link.source.id;
      const targetId = typeof link.target === 'number' ? link.target : link.target.id;
      
      const key = [Math.min(sourceId, targetId), Math.max(sourceId, targetId)].join('-');
      
      if (!this.linkGroups.has(key)) {
        this.linkGroups.set(key, []);
      }
      this.linkGroups.get(key)?.push(link as unknown as LinkData);
    });
  }

  getPath(d: SimulationLinkDatum<any>): string {
    const source = d.source as any;
    const target = d.target as any;
    return `M${source.x},${source.y}L${target.x},${target.y}`;
  }

  private createCurvedPath(d: LinkData, links: LinkData[]): string {
    const index = links.indexOf(d);
    const total = links.length;
    const curveOffset = 30 * (index - (total - 1) / 2);
    
    const dx = d.target.x! - d.source.x!;
    const dy = d.target.y! - d.source.y!;
    const midX = (d.source.x! + d.target.x!) / 2;
    const midY = (d.source.y! + d.target.y!) / 2;
    
    const length = Math.sqrt(dx * dx + dy * dy);
    const normalX = -dy / length;
    const normalY = dx / length;
    
    const cpX = midX + normalX * curveOffset;
    const cpY = midY + normalY * curveOffset;
    
    return `M${d.source.x},${d.source.y} Q${cpX},${cpY} ${d.target.x},${d.target.y}`;
  }

  private createStraightPath(d: LinkData): string {
    return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
  }
}