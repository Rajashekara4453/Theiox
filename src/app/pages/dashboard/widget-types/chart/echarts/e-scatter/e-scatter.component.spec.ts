import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EScatterComponent } from './e-scatter.component';

describe('EScatterComponent', () => {
  let component: EScatterComponent;
  let fixture: ComponentFixture<EScatterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EScatterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EScatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
