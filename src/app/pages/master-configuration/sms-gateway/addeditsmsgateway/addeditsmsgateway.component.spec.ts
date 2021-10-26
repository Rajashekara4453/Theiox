import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddeditsmsgatewayComponent } from './addeditsmsgateway.component';

describe('Create editsmsgatewayComponent', () => {
  let component: AddeditsmsgatewayComponent;
  let fixture: ComponentFixture<AddeditsmsgatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddeditsmsgatewayComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddeditsmsgatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
