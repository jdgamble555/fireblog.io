import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { CommentComponent } from './comment/comment.component';
import { PostComponent } from './post.component';


@NgModule({
  declarations: [
    PostComponent,
    CommentComponent
  ],
  imports: [
    SharedModule,
    MarkdownModule.forChild()
  ],
  exports: [
    PostComponent,
    CommentComponent
  ]
})
export class PostModule { }
