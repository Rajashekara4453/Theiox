import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseManagementComponent } from './license-management.component';

describe('LicenseManagementComponent', () => {
  let component: LicenseManagementComponent;
  let fixture: ComponentFixture<LicenseManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenseManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
