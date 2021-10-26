import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicPagesComponent } from './dynamic-pages.component';

describe('DynamicPagesComponent', () => {
  let component: DynamicPagesComponent;
  let fixture: ComponentFixture<DynamicPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
