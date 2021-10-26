import { TestBed } from '@angular/core/testing';

import { PreviewPopUpService } from './preview-pop-up.service';

describe('PreviewPopUpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreviewPopUpService = TestBed.get(PreviewPopUpService);
    expect(service).toBeTruthy();
  });
});
