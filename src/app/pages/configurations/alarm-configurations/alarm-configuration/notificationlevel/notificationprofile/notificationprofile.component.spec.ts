import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationprofileComponent } from './notificationprofile.component';

describe('NotificationprofileComponent', () => {
  let component: NotificationprofileComponent;
  let fixture: ComponentFixture<NotificationprofileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationprofileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
