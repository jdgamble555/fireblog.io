import { NgModule } from '@angular/core';
import { PostFormRoutingModule } from './post-form-routing.module';
import { PostFormComponent } from './post-form.component';
import { SharedModule } from '../../shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';
import { MarkdownEditorModule } from '@shared/markdown-editor/markdown-editor.module';
import { PostEditModule } from '@db/post-edit.module';
import { AutoSaveDirective } from '@shared/auto-save/auto-save.directive';
import { MaterialModule } from '@core/material.module';
import { AuthEditModule } from '@db/auth-edit.module';
import { ConfirmDialogModule } from '@shared/confirm-dialog/confirm-dialog.module';

// only import if browser
if (typeof window !== 'undefined') {
  import('@github/markdown-toolbar-element');
}

const modules = [
  PostFormRoutingModule,
  SharedModule,
  PostEditModule,
  MaterialModule,
  ConfirmDialogModule,
  AuthEditModule,
  MaterialModule
];
@NgModule({
  declarations: [
    PostFormComponent,
    AutoSaveDirective,
  ],
  imports: [
    MarkdownModule.forChild(),
    MarkdownEditorModule,
    ...modules
  ],
  exports: [...modules]
})
export class PostFormModule { }
