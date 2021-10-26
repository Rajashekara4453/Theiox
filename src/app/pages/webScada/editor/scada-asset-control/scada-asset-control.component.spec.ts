import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScadaAssetControlComponent } from './scada-asset-control.component';

describe('ScadaAssetControlComponent', () => {
  let component: ScadaAssetControlComponent;
  let fixture: ComponentFixture<ScadaAssetControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScadaAssetControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScadaAssetControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
