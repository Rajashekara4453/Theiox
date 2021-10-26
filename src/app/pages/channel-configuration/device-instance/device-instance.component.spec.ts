import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceInstanceComponent } from './device-instance.component';

describe('DeviceInstanceComponent', () => {
  let component: DeviceInstanceComponent;
  let fixture: ComponentFixture<DeviceInstanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceInstanceComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
