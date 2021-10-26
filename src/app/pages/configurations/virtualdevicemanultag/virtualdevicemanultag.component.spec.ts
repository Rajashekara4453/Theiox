import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualdevicemanultagComponent } from './virtualdevicemanultag.component';

describe('VirtualdevicemanultagComponent', () => {
  let component: VirtualdevicemanultagComponent;
  let fixture: ComponentFixture<VirtualdevicemanultagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualdevicemanultagComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualdevicemanultagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
