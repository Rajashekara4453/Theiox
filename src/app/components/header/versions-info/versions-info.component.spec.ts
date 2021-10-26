import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionsInfoComponent } from './versions-info.component';

describe('VersionsInfoComponent', () => {
  let component: VersionsInfoComponent;
  let fixture: ComponentFixture<VersionsInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VersionsInfoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
