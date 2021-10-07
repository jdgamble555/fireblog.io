import { TestBed } from '@angular/core/testing';

import { FbReadService } from './fb-read.service';

describe('FbReadService', () => {
  let service: FbReadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FbReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
