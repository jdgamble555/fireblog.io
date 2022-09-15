import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { PostDbService } from '@db/post/post-db.service';

import { PostListResolver } from './post-list.resolver';

describe('PostListResolver', () => {
  let resolver: PostListResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [PostDbService]
    });
    resolver = TestBed.inject(PostListResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });
});
