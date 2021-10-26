import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmPriorityTypesComponent } from './alarm-priority-types.component';

describe('AlarmPriorityTypesComponent', () => {
  let component: AlarmPriorityTypesComponent;
  let fixture: ComponentFixture<AlarmPriorityTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlarmPriorityTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmPriorityTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
