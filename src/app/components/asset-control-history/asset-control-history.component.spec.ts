import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetControlHistoryComponent } from './asset-control-history.component';

describe('AssetControlHistoryComponent', () => {
  let component: AssetControlHistoryComponent;
  let fixture: ComponentFixture<AssetControlHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssetControlHistoryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetControlHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
