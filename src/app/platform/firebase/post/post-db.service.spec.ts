import { TestBed } from '@angular/core/testing';

import { PostDbService } from './post-db.service';

describe('PostDbService', () => {
  let service: PostDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
