import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PueKpiComponent } from './pue-kpi.component';

describe('PueKpiComponent', () => {
  let component: PueKpiComponent;
  let fixture: ComponentFixture<PueKpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PueKpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PueKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
