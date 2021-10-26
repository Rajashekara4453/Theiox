import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkGroupComponent } from './work-group.component';

describe('WorkGroupComponent', () => {
  let component: WorkGroupComponent;
  let fixture: ComponentFixture<WorkGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkGroupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
