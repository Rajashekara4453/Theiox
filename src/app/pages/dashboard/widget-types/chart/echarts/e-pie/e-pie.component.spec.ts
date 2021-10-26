import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EPieComponent } from './e-pie.component';

describe('EPieComponent', () => {
  let component: EPieComponent;
  let fixture: ComponentFixture<EPieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EPieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
