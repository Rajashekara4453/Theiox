import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EGaugeComponent } from './e-gauge.component';

describe('EGaugeComponent', () => {
  let component: EGaugeComponent;
  let fixture: ComponentFixture<EGaugeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EGaugeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
