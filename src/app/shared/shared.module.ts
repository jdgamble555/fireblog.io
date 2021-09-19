import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoSaveDirective } from './auto-save/auto-save.directive';
import { ConfirmDialogModule } from './confirm-dialog/confirm-dialog.module';
import { DropZoneDirective } from './drop-zone/drop-zone.directive';


const modules = [
  FormsModule,
  ConfirmDialogModule
];

const directives = [
  AutoSaveDirective,
  DropZoneDirective
];

@NgModule({
  declarations: [
    ...directives
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...directives
  ]
})
export class SharedModule { }
