import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ELineComponent } from './e-line.component';

describe('ELineComponent', () => {
  let component: ELineComponent;
  let fixture: ComponentFixture<ELineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ELineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ELineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
