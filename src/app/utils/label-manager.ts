import * as d3 from 'd3';

export class LabelManager {
  private readonly nodeRadius: number = 28;
  private readonly charsPerPixel: number = 0.3;

  updateLabels(selection: d3.Selection<any, any, any, any>, scale: number) {
    const visibleWidth = this.nodeRadius * 2;
    const maxChars = Math.floor(visibleWidth * this.charsPerPixel * scale);
    
    selection.each(function(this: d3.BaseType, d: any) {
      const text = d.name;
      const truncatedText = text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
      
      const element = d3.select(this);
      element.selectAll('*').remove();
      
      const words = truncatedText.split(' ');
      let lines = [''];
      let lineNumber = 0;
      
      words.forEach((word: string) => {
        const testLine = lines[lineNumber] + (lines[lineNumber] ? ' ' : '') + word;
        if (testLine.length * 6 > visibleWidth * scale) {
          lineNumber++;
          lines[lineNumber] = word;
        } else {
          lines[lineNumber] = testLine;
        }
      });

      lines = lines.slice(0, 3);
      if (lines.length === 3 && words.length > lines.join(' ').split(' ').length) {
        lines[2] = lines[2].replace(/\s*\S*$/, '...');
      }
      
      lines.forEach((line, i) => {
        element.append('tspan')
          .attr('x', 0)
          .attr('dy', i === 0 ? `-${(lines.length - 1) * 0.6}em` : '1.2em')
          .text(line);
      });
    });
  }
}
