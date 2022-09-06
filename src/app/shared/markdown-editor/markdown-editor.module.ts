import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';

// only import if browser
if (typeof window !== 'undefined') {
  import('@github/markdown-toolbar-element');
}

@NgModule({
  declarations: [
    MarkdownEditorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFieldModule
  ],
  exports: [MarkdownEditorComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarkdownEditorModule { }
