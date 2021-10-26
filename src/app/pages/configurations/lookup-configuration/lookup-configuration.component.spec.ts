import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupConfigurationComponent } from './lookup-configuration.component';

describe('LookupConfigurationComponent', () => {
  let component: LookupConfigurationComponent;
  let fixture: ComponentFixture<LookupConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LookupConfigurationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
