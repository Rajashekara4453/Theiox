import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinSidebarComponent } from './pin-sidebar.component';

describe('PinSidebarComponent', () => {
  let component: PinSidebarComponent;
  let fixture: ComponentFixture<PinSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PinSidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
