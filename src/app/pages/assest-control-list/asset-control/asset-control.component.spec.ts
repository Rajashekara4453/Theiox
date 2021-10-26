import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetControlComponent } from './asset-control.component';

describe('AssetControlComponent', () => {
  let component: AssetControlComponent;
  let fixture: ComponentFixture<AssetControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
