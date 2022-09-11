import { TestBed } from '@angular/core/testing';

import { UserDbService } from './user-db.service';

describe('UserDbService', () => {
  let service: UserDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
