import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayInstanceComponent } from './gateway-instance.component';

describe('GatewayInstanceComponent', () => {
  let component: GatewayInstanceComponent;
  let fixture: ComponentFixture<GatewayInstanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GatewayInstanceComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
