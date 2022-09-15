import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { TagDbService } from '@db/post/tag-db.service';

import { TagListService } from './tag-list.service';

describe('TagListService', () => {
  let service: TagListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [TagDbService]
    });
    service = TestBed.inject(TagListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
