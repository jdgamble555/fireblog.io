import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@core/core.module';
import { DbModule } from '@db/db.module';
import { MarkdownModule } from 'ngx-markdown';


import { LoginGuard } from './auth.guard';

describe('LoginGuard', () => {
  let guard: LoginGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        DbModule,
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
