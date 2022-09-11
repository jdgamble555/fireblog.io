import { TestBed } from '@angular/core/testing';

import { TagDbService } from './tag-db.service';

describe('TagDbService', () => {
  let service: TagDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TagDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
