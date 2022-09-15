import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { PostDbService } from '@db/post/post-db.service';

import { PostGuard } from './post.guard';

describe('PostGuard', () => {
  let guard: PostGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [PostDbService]
    });
    guard = TestBed.inject(PostGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
