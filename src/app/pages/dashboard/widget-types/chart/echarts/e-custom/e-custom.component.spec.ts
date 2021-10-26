import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ECustomComponent } from './e-custom.component';

describe('ECustomComponent', () => {
  let component: ECustomComponent;
  let fixture: ComponentFixture<ECustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ECustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ECustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
