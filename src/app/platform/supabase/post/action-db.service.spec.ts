import { TestBed } from '@angular/core/testing';

import { ActionDbService } from './action-db.service';

describe('ActionDbService', () => {
  let service: ActionDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
