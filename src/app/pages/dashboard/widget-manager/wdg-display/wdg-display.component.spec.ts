import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdgDisplayComponent } from './wdg-display.component';

describe('WdgDisplayComponent', () => {
  let component: WdgDisplayComponent;
  let fixture: ComponentFixture<WdgDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WdgDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdgDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
