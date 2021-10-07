import { TestBed } from '@angular/core/testing';

import { FbImageUploadService } from './fb-image-upload.service';

describe('FbImageUploadService', () => {
  let service: FbImageUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbImageUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
