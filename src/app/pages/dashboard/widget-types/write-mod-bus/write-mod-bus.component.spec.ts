import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteModBusComponent } from './write-mod-bus.component';

describe('WriteModBusComponent', () => {
  let component: WriteModBusComponent;
  let fixture: ComponentFixture<WriteModBusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteModBusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteModBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
