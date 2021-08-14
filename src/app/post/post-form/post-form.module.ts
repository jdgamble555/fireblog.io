import { NgModule } from '@angular/core';
import { PostFormRoutingModule } from './post-form-routing.module';
import { CoreModule } from '../../core/core.module';
import { PostFormComponent } from './post-form.component';
import { SharedModule } from '../../shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { ImageUploadModule } from 'src/app/shared/image-upload/image-upload.module';


const modules = [
  PostFormRoutingModule,
  CoreModule,
  SharedModule,
  ImageUploadModule
];
@NgModule({
  declarations: [PostFormComponent],
  imports: [
    MarkdownModule.forChild(),
    ...modules
  ],
  exports: [...modules]
})
export class PostFormModule { }
