import { TestBed } from '@angular/core/testing';

import { PwaAppUpdateService } from './pwa-app-update.service';

describe('PwaAppUpdateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PwaAppUpdateService = TestBed.get(PwaAppUpdateService);
    expect(service).toBeTruthy();
  });
});
