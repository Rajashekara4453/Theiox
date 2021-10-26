import { TestBed } from '@angular/core/testing';

import { ServiceloaderService } from './serviceloader.service';

describe('ServiceloaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServiceloaderService = TestBed.get(ServiceloaderService);
    expect(service).toBeTruthy();
  });
});
