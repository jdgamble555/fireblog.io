import { TestBed } from '@angular/core/testing';

import { PostListResolver } from './post-list.resolver';

describe('PostListResolver', () => {
  let resolver: PostListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(PostListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
