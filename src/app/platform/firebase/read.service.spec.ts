import { TestBed } from '@angular/core/testing';

import { ReadService } from './read.service';

describe('ReadService', () => {
  let service: ReadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
