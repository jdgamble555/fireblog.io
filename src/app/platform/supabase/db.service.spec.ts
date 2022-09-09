import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { DbModule } from './db.module';
import { DbService } from './db.service';


describe('DbService', () => {
  let service: DbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DbModule, MarkdownModule.forRoot(), RouterTestingModule],
      providers: [MarkdownService]
    });
    service = TestBed.inject(DbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
