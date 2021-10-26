import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdgShowComponent } from './wdg-show.component';

describe('WdgShowComponent', () => {
  let component: WdgShowComponent;
  let fixture: ComponentFixture<WdgShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WdgShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdgShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
