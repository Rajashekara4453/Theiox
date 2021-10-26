import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayModelComponent } from './gateway-model.component';

describe('GatewayModelComponent', () => {
  let component: GatewayModelComponent;
  let fixture: ComponentFixture<GatewayModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GatewayModelComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
