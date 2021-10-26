import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceMenubarComponent } from './device-menubar.component';

describe('DeviceMenubarComponent', () => {
  let component: DeviceMenubarComponent;
  let fixture: ComponentFixture<DeviceMenubarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceMenubarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceMenubarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
