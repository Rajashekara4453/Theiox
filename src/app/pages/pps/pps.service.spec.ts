import { TestBed } from '@angular/core/testing';

import { PpsService } from './pps.service';

describe('PpsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PpsService = TestBed.get(PpsService);
    expect(service).toBeTruthy();
  });
});
