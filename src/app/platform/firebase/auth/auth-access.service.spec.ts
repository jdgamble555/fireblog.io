import { TestBed } from '@angular/core/testing';

import { AuthAccessService } from './auth-access.service';

describe('AuthAccessService', () => {
  let service: AuthAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
