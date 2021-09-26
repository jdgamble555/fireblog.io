import { TestBed } from '@angular/core/testing';

import { FirestoreToolsService } from './firestore-tools.service';

describe('FirestoreToolsService', () => {
  let service: FirestoreToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirestoreToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
