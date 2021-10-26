import { TestBed } from '@angular/core/testing';

import { ImageDetailsService } from './image-details.service';

describe('ImageDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageDetailsService = TestBed.get(ImageDetailsService);
    expect(service).toBeTruthy();
  });
});
