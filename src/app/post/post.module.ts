import { NgModule } from '@angular/core';

import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './post.component';
import { CoreModule } from '../core/core.module';

import { LikeComponent } from '../like/like.component';
import { HttpClientModule } from '@angular/common/http';
import { DocPipe } from '../shared/doc.pipe';
import { TagModule } from '../tag/tag.module';
import { MarkdownModule } from 'ngx-markdown';

const components = [
  PostComponent,
  LikeComponent
];

const modules = [
  CoreModule,
  PostRoutingModule,
  HttpClientModule,
  TagModule
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    MarkdownModule.forChild(),
    ...modules
  ],
  exports: [
    ...components,
    ...modules
  ],
  providers: [
    DocPipe
  ]
})
export class PostModule { }
