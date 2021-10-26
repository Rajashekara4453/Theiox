import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ETreemapComponent } from './e-treemap.component';

describe('ETreemapComponent', () => {
  let component: ETreemapComponent;
  let fixture: ComponentFixture<ETreemapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ETreemapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ETreemapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
