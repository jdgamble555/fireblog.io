import { TestBed } from '@angular/core/testing';

import { TagListService } from './tag-list.service';

describe('TagListService', () => {
  let service: TagListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
