import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetManagerComponent } from './widget-manager.component';

describe('WidgetManagerComponent', () => {
  let component: WidgetManagerComponent;
  let fixture: ComponentFixture<WidgetManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
