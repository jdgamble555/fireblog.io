import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';

import { UserEditService } from './user-edit.service';

describe('UserEditService', () => {
  let service: UserEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [UserEditService]
    });
    service = TestBed.inject(UserEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
