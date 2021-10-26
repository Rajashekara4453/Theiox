import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssestControlListComponent } from './assest-control-list.component';

describe('AssestControlListComponent', () => {
  let component: AssestControlListComponent;
  let fixture: ComponentFixture<AssestControlListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssestControlListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssestControlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
