import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexiTileComponent } from './flexi-tile.component';

describe('FlexiTileComponent', () => {
  let component: FlexiTileComponent;
  let fixture: ComponentFixture<FlexiTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlexiTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexiTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
