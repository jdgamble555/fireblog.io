import { TestBed } from '@angular/core/testing';

import { UsernameGuard } from './username.guard';

describe('UsernameGuard', () => {
  let guard: UsernameGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UsernameGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
