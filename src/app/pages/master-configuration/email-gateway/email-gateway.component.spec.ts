import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailGatewayComponent } from './email-gateway.component';

describe('EmailGatewayComponent', () => {
  let component: EmailGatewayComponent;
  let fixture: ComponentFixture<EmailGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmailGatewayComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
