import { TestBed } from '@angular/core/testing';

import { LeftnavService } from './leftnav.service';

describe('LeftnavService', () => {
  let service: LeftnavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeftnavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
