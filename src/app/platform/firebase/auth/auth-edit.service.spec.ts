import { TestBed } from '@angular/core/testing';

import { AuthEditService } from './auth-edit.service';

describe('AuthEditService', () => {
  let service: AuthEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
