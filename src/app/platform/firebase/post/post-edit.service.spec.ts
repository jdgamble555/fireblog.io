import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DbModule } from '@db/db.module';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { PostEditService } from './post-edit.service';

describe('PostEditService', () => {
  let service: PostEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DbModule,
        MarkdownModule.forRoot({
          sanitize: SecurityContext.NONE
        })
      ],
      providers: [PostEditService, MarkdownService]
    });
    service = TestBed.inject(PostEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
