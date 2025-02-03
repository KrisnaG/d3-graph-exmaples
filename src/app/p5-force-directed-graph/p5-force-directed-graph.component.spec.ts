import { ComponentFixture, TestBed } from '@angular/core/testing';

import { J5ForceDirectedGraphComponent } from './p5-force-directed-graph.component';

describe('J5ForceDirectedGraphComponent', () => {
  let component: J5ForceDirectedGraphComponent;
  let fixture: ComponentFixture<J5ForceDirectedGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [J5ForceDirectedGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(J5ForceDirectedGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
