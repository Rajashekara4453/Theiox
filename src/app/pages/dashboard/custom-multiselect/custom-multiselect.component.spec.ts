import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMultiselectComponent } from './custom-multiselect.component';

describe('CustomMultiselectComponent', () => {
  let component: CustomMultiselectComponent;
  let fixture: ComponentFixture<CustomMultiselectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomMultiselectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomMultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
