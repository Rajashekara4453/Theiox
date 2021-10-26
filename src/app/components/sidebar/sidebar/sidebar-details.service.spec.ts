import { TestBed } from '@angular/core/testing';

import { SidebarDetailsService } from './sidebar-details.service';

describe('SidebarDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SidebarDetailsService = TestBed.get(SidebarDetailsService);
    expect(service).toBeTruthy();
  });
});
