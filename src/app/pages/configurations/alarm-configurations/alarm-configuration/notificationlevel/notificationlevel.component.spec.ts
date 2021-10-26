import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationlevelComponent } from './notificationlevel.component';

describe('NotificationlevelComponent', () => {
  let component: NotificationlevelComponent;
  let fixture: ComponentFixture<NotificationlevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationlevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationlevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
