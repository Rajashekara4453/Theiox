import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualdeviceComponent } from './virtualdevice.component';

describe('VirtualdeviceComponent', () => {
  let component: VirtualdeviceComponent;
  let fixture: ComponentFixture<VirtualdeviceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualdeviceComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualdeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
