import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EMarkerPointerComponent } from './e-marker-pointer.component';

describe('EMarkerPointerComponent', () => {
  let component: EMarkerPointerComponent;
  let fixture: ComponentFixture<EMarkerPointerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EMarkerPointerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {    
    fixture = TestBed.createComponent(EMarkerPointerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
