import { TestBed } from '@angular/core/testing';

import { ChipService } from './chip.service';

describe('ChipService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChipService = TestBed.get(ChipService);
    expect(service).toBeTruthy();
  });
});
