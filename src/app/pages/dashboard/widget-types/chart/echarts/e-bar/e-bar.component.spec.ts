import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EBarComponent } from './e-bar.component';

describe('EBarComponent', () => {
  let component: EBarComponent;
  let fixture: ComponentFixture<EBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
