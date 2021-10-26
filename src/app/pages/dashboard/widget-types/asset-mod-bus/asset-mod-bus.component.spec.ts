import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModBusComponent } from './asset-mod-bus.component';

describe('AssetModBusComponent', () => {
  let component: AssetModBusComponent;
  let fixture: ComponentFixture<AssetModBusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModBusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
