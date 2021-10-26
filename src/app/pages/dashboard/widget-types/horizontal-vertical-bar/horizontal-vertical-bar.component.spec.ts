import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalVerticalBarComponent } from './horizontal-vertical-bar.component';

describe('HorizontalVerticalBarComponent', () => {
  let component: HorizontalVerticalBarComponent;
  let fixture: ComponentFixture<HorizontalVerticalBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizontalVerticalBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalVerticalBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
