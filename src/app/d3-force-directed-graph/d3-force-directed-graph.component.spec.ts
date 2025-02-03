import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ForceDirectedGraphComponent } from './d3-force-directed-graph.component';

describe('ForceDirectedGraphComponent', () => {
  let component: D3ForceDirectedGraphComponent;
  let fixture: ComponentFixture<D3ForceDirectedGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ForceDirectedGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ForceDirectedGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
