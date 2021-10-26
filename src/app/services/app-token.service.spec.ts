import { TestBed } from '@angular/core/testing';

import { AppTokenService } from './app-token.service';

describe('AppTokenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppTokenService = TestBed.get(AppTokenService);
    expect(service).toBeTruthy();
  });
});
