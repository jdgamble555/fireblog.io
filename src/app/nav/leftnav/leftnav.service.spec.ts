import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { PostDbService } from '@db/post/post-db.service';

import { LeftnavService } from './leftnav.service';

describe('LeftnavService', () => {
  let service: LeftnavService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [PostDbService]
    });
    service = TestBed.inject(LeftnavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
