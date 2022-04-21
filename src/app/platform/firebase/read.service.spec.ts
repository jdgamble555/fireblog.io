import { TestBed } from '@angular/core/testing';
import { FirebaseAppModule } from '@angular/fire/app';
import { FirestoreModule } from '@angular/fire/firestore';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { FirebaseModule } from './firebase.module';

import { ReadService } from './read.service';

describe('ReadService', () => {
  let service: ReadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FirebaseModule, MarkdownModule, FirestoreModule, MarkdownModule.forRoot()],
      providers: [MarkdownService]
    });
    service = TestBed.inject(ReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
