import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';

import { PostDbService } from './post-db.service';

describe('PostDbService', () => {
  let service: PostDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule]
    });
    service = TestBed.inject(PostDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
