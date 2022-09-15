import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';

import { ActionDbService } from './action-db.service';

describe('ActionDbService', () => {
  let service: ActionDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule],
    });
    service = TestBed.inject(ActionDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
