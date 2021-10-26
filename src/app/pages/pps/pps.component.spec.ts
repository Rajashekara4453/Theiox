import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PpsComponent } from './pps.component';

describe('PpsComponent', () => {
  let component: PpsComponent;
  let fixture: ComponentFixture<PpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
