import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebScadaComponent } from './webscada.component';

describe('ScadaComponent', () => {
  let component: WebScadaComponent;
  let fixture: ComponentFixture<WebScadaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebScadaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebScadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
