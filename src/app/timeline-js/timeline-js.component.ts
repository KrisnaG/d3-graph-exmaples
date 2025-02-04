import { Component, OnInit } from '@angular/core';

declare const TL: any;

@Component({
  selector: 'app-timeline-js',
  standalone: true,
  template: `
    <div id="timeline-embed" style="width: 100%; height: 600px; overflow: hidden;"></div>
  `,
  styles: [`
    :host ::ng-deep {
      .tl-storyslider {
        display: none;
      }
      .tl-timenav {
        height: 100% !important;
      }
      .tl-timemarker {
        height: 100% !important;
        top: 0 !important;
        .tl-timemarker-content-container {
          height: auto !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          position: absolute !important;
        }
        .tl-timemarker-line-left, 
        .tl-timemarker-line-right {
          height: 100% !important;
          top: 0 !important;
          position: absolute !important;
        }
        .tl-timemarker-timespan {
          height: 100% !important;
          top: 0 !important;
          .tl-timemarker-timespan-content {
            height: 100% !important;
          }
        }
      }
      .tl-timegroup {
        top: 0 !important;
      }
      .tl-timeaxis {
        top: auto !important;
        bottom: 0 !important;
      }
    }
  `]
})
export class TimelineJSComponent implements OnInit {
  ngOnInit() {
    const options = {
      events: [
        {
          start_date: {
            year: '2024',
            month: '1',
            day: '1'
          },
          text: {
            headline: 'Sample Event 1',
            text: 'This is a sample timeline event'
          }
        },
        {
          start_date: {
            year: '2024',
            month: '1',
            day: '10'
          },
          text: {
            headline: 'Sample Event 2 and some other text',
            text: 'This is a sample timeline event'
          }
        },
        {
          start_date: {
            year: '2024',
            month: '2',
            day: '1'
          },
          text: {
            headline: 'Sample Event 3',
            text: 'Another sample timeline event'
          }
        }
      ],
      timenav_height_percentage: 100,
      timenav_height_min: 600,
      timenav_mobile_height_percentage: 100,
      scale_factor: 1,
      height: 600
    };

    new TL.Timeline('timeline-embed', options);
  }
}