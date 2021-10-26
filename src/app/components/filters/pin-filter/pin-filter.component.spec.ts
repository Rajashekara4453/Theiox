import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinFilterComponent } from './pin-filter.component';

describe('PinFilterComponent', () => {
  let component: PinFilterComponent;
  let fixture: ComponentFixture<PinFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PinFilterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
