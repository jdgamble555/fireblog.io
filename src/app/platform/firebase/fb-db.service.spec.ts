import { TestBed } from '@angular/core/testing';

import { FbDbService } from './fb-db.service';

describe('FbDbService', () => {
  let service: FbDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
