import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchEntryComponent } from './batch-entry.component';

describe('BatchEntryComponent', () => {
  let component: BatchEntryComponent;
  let fixture: ComponentFixture<BatchEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BatchEntryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
