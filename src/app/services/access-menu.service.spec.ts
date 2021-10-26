import { TestBed } from '@angular/core/testing';

import { AccessMenuService } from './access-menu.service';

describe('AccessMenuService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccessMenuService = TestBed.get(AccessMenuService);
    expect(service).toBeTruthy();
  });
});
