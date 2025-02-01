import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForceDirectedGraphComponent } from './force-directed-graph.component';

describe('ForceDirectedGraphComponent', () => {
  let component: ForceDirectedGraphComponent;
  let fixture: ComponentFixture<ForceDirectedGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForceDirectedGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForceDirectedGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
