import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinuteSecondInputsComponent } from './minute-second-inputs.component';

describe('MinuteSecondInputsComponent', () => {
  let component: MinuteSecondInputsComponent;
  let fixture: ComponentFixture<MinuteSecondInputsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinuteSecondInputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinuteSecondInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
