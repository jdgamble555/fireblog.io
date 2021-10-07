import { TestBed } from '@angular/core/testing';

import { FbAuthService } from './fb-auth.service';

describe('FbAuthService', () => {
  let service: FbAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
