import { TestBed } from '@angular/core/testing';

import { PostListGuard } from './post-list.guard';

describe('PostListGuard', () => {
  let guard: PostListGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PostListGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
