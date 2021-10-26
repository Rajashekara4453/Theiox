import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniSidebarMenuComponent } from './mini-sidebar-menu.component';

describe('MiniSidebarMenuComponent', () => {
  let component: MiniSidebarMenuComponent;
  let fixture: ComponentFixture<MiniSidebarMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MiniSidebarMenuComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniSidebarMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
