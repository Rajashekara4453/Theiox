import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalTileComponent } from './normal-tile.component';

describe('NormalTileComponent', () => {
  let component: NormalTileComponent;
  let fixture: ComponentFixture<NormalTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NormalTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NormalTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
