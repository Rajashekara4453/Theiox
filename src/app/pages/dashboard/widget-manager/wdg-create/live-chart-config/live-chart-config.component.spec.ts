import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveChartConfigComponent } from './live-chart-config.component';

describe('LiveChartConfigComponent', () => {
  let component: LiveChartConfigComponent;
  let fixture: ComponentFixture<LiveChartConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveChartConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveChartConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
