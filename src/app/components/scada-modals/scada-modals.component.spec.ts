import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScadaModalsComponent } from './scada-modals.component';

describe('ScadaModalsComponent', () => {
  let component: ScadaModalsComponent;
  let fixture: ComponentFixture<ScadaModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScadaModalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScadaModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
