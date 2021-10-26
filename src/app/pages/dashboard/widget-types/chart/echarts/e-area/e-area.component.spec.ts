import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EAreaComponent } from './e-area.component';

describe('EAreaComponent', () => {
  let component: EAreaComponent;
  let fixture: ComponentFixture<EAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
