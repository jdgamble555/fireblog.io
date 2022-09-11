import { TestBed } from '@angular/core/testing';

import { PostGuard } from './post.guard';

describe('PostGuard', () => {
  let guard: PostGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PostGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
