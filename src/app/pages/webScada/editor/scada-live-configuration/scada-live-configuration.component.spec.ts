import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScadaLiveConfigurationComponent } from './scada-live-configuration.component';

describe('ScadaLiveConfigurationComponent', () => {
  let component: ScadaLiveConfigurationComponent;
  let fixture: ComponentFixture<ScadaLiveConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScadaLiveConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScadaLiveConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
