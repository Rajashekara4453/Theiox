import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomHierarchyComponent } from './custom-hierarchy.component';

describe('CustomHierarchyComponent', () => {
  let component: CustomHierarchyComponent;
  let fixture: ComponentFixture<CustomHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
