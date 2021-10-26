import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WdgCreateComponent } from './wdg-create.component';

describe('WdgCreateComponent', () => {
  let component: WdgCreateComponent;
  let fixture: ComponentFixture<WdgCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WdgCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WdgCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
