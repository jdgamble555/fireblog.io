import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { DbModule } from '@db/db.module';
import { UserDbService } from '@db/user/user-db.service';

import { UsernameGuard } from './username.guard';

describe('UsernameGuard', () => {
  let guard: UsernameGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
      providers: [UserDbService, FormBuilder]
    });
    guard = TestBed.inject(UsernameGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
