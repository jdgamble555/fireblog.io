import { TestBed } from '@angular/core/testing';
import { MarkdownModule } from 'ngx-markdown';
import { AutoSaveDirective } from './auto-save.directive';

describe('AutoSaveDirective', () => {
  it('should create an instance', () => {
    const directive = new AutoSaveDirective();
    TestBed.configureTestingModule({
      imports: [MarkdownModule.forRoot()]
    })
    expect(directive).toBeTruthy();
  });
});
