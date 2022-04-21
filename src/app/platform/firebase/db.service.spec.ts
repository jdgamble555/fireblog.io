import { TestBed } from '@angular/core/testing';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';

import { DbService } from './db.service';
import { FirebaseModule } from './firebase.module';

describe('DbService', () => {
  let service: DbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FirebaseModule, MarkdownModule.forRoot()],
      providers: [MarkdownService]
    });
    service = TestBed.inject(DbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
