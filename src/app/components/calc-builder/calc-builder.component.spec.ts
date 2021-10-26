import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcBuilderComponent } from './calc-builder.component';

describe('CalcBuilderComponent', () => {
  let component: CalcBuilderComponent;
  let fixture: ComponentFixture<CalcBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CalcBuilderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
