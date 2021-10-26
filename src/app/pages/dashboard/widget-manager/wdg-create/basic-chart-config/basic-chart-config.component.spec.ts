import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicChartConfigComponent } from './basic-chart-config.component';

describe('BasicChartConfigComponent', () => {
  let component: BasicChartConfigComponent;
  let fixture: ComponentFixture<BasicChartConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicChartConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicChartConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
