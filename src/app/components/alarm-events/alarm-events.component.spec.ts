import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmEventsComponent } from './alarm-events.component';

describe('AlarmEventsComponent', () => {
  let component: AlarmEventsComponent;
  let fixture: ComponentFixture<AlarmEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AlarmEventsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
