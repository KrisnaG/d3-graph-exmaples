import { ComponentFixture, TestBed } from '@angular/core/testing';

import { P5ForceDirectedGraphComponent } from './p5-force-directed-graph.component';

describe('P5ForceDirectedGraphComponent', () => {
  let component: P5ForceDirectedGraphComponent;
  let fixture: ComponentFixture<P5ForceDirectedGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [P5ForceDirectedGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(P5ForceDirectedGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
