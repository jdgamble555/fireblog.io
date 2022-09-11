import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { PostListComponent } from './post-list.component';


@NgModule({
  declarations: [
    PostListComponent
  ],
  imports: [
    SharedModule,
    MarkdownModule.forChild()
  ],
  exports: [
    PostListComponent
  ]
})
export class PostListModule { }
