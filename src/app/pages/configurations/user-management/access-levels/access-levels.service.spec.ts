import { TestBed } from '@angular/core/testing';

import { AccessLevelsService } from './access-levels.service';

describe('AccessLevelsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccessLevelsService = TestBed.get(AccessLevelsService);
    expect(service).toBeTruthy();
  });
});
