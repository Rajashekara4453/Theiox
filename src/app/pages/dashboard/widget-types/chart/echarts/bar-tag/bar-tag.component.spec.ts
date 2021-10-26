import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarTagComponent } from './bar-tag.component';

describe('BarTagComponent', () => {
  let component: BarTagComponent;
  let fixture: ComponentFixture<BarTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
