import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { UserEditService } from '@db/user/user-edit.service';

import { AuthEditService } from './auth-edit.service';

describe('AuthEditService', () => {
  let service: AuthEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [AuthEditService, UserEditService]
    });
    service = TestBed.inject(AuthEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
