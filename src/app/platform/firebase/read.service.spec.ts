import { TestBed } from '@angular/core/testing';
import { FirestoreModule } from '@angular/fire/firestore';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { DbModule } from './db.module';


import { ReadService } from './read.service';

describe('ReadService', () => {
  let service: ReadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule, MarkdownModule, FirestoreModule, MarkdownModule.forRoot(), RouterTestingModule],
      providers: [MarkdownService]
    });
    service = TestBed.inject(ReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
