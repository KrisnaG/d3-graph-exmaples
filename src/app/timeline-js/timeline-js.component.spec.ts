import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineJSComponent } from './timeline-js.component';

describe('TimelineJSComponent', () => {
  let component: TimelineJSComponent;
  let fixture: ComponentFixture<TimelineJSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineJSComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineJSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
