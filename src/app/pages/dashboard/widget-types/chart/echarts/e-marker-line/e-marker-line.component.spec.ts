import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EMarkerLineComponent } from './e-marker-line.component';

describe('EMarkerLineComponent', () => {
  let component: EMarkerLineComponent;
  let fixture: ComponentFixture<EMarkerLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EMarkerLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EMarkerLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
