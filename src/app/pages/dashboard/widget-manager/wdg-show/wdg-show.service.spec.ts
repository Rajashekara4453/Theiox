import { TestBed } from '@angular/core/testing';

import { WdgShowService } from './wdg-show.service';

describe('WdgShowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WdgShowService = TestBed.get(WdgShowService);
    expect(service).toBeTruthy();
  });
});
