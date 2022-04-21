import { TestBed } from '@angular/core/testing';
import { AuthModule } from '@angular/fire/auth';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';

import { AuthService } from './auth.service';
import { FirebaseModule } from './firebase.module';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FirebaseModule, AuthModule, MarkdownModule.forRoot()],
      providers: [MarkdownService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
