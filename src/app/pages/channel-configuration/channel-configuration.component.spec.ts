import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelConfigurationComponent } from './channel-configuration.component';

describe('ChannelConfigurationComponent', () => {
  let component: ChannelConfigurationComponent;
  let fixture: ComponentFixture<ChannelConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelConfigurationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
