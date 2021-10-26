import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThresholdConfigComponent } from './threshold-config.component';

describe('ThresholdConfigComponent', () => {
  let component: ThresholdConfigComponent;
  let fixture: ComponentFixture<ThresholdConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThresholdConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThresholdConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
