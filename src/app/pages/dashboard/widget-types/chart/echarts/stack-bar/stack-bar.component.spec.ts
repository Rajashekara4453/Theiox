import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StackBarComponent } from './stack-bar.component';

describe('StackBarComponent', () => {
  let component: StackBarComponent;
  let fixture: ComponentFixture<StackBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StackBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
