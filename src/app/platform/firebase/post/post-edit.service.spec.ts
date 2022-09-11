import { TestBed } from '@angular/core/testing';

import { PostEditService } from './post-edit.service';

describe('PostEditService', () => {
  let service: PostEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
