import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DfmComponent } from './dfm.component';

describe('DfmComponent', () => {
  let component: DfmComponent;
  let fixture: ComponentFixture<DfmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DfmComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DfmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
