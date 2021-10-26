import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EPfComponent } from './e-pf.component';

describe('EPfComponent', () => {
  let component: EPfComponent;
  let fixture: ComponentFixture<EPfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EPfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EPfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
