import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';

import { TagDbService } from './tag-db.service';

describe('TagDbService', () => {
  let service: TagDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [TagDbService]
    });
    service = TestBed.inject(TagDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
