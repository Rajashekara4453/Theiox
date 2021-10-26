import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddeditemailgatewayComponent } from './addeditemailgateway.component';

describe('Create editemailgatewayComponent', () => {
  let component: AddeditemailgatewayComponent;
  let fixture: ComponentFixture<AddeditemailgatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddeditemailgatewayComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddeditemailgatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
