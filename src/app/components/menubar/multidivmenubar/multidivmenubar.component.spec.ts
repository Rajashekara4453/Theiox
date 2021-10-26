import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiDivMenubarComponent } from './multidivmenubar.component';

describe('MenubarComponent', () => {
  let component: MultiDivMenubarComponent;
  let fixture: ComponentFixture<MultiDivMenubarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MultiDivMenubarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiDivMenubarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
