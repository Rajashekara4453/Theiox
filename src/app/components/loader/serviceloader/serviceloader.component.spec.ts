import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceloaderComponent } from './serviceloader.component';

describe('ServiceloaderComponent', () => {
  let component: ServiceloaderComponent;
  let fixture: ComponentFixture<ServiceloaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceloaderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
