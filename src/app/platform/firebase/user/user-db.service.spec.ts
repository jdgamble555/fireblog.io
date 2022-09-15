import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';

import { UserDbService } from './user-db.service';

describe('UserDbService', () => {
  let service: UserDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [UserDbService]
    });
    service = TestBed.inject(UserDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
