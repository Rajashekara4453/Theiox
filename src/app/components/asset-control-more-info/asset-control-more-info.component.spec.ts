import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetControlMoreInfoComponent } from './asset-control-more-info.component';

describe('AssetControlMoreInfoComponent', () => {
  let component: AssetControlMoreInfoComponent;
  let fixture: ComponentFixture<AssetControlMoreInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssetControlMoreInfoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetControlMoreInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
