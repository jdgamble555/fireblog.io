import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { CoreModule } from '../core/core.module';
import { FirebaseModule } from '../platform/firebase/firebase.module';

import { LoginGuard } from './auth.guard';

describe('LoginGuard', () => {
  let guard: LoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        FirebaseModule,
        MarkdownModule.forRoot(),
        RouterModule.forRoot([])
      ]
    });
    guard = TestBed.inject(LoginGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
