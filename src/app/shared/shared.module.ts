import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@core/core.module';
import { AutoSaveDirective } from './auto-save/auto-save.directive';
import { ConfirmDialogModule } from './confirm-dialog/confirm-dialog.module';
import { DropZoneDirective } from './drop-zone/drop-zone.directive';
import { HeartComponent } from './heart/heart.component';
import { SaveComponent } from './save/save.component';


const modules = [
  FormsModule,
  ConfirmDialogModule,
  CoreModule
];

const directives = [
  AutoSaveDirective,
  DropZoneDirective
];

const components = [
  HeartComponent,
  SaveComponent
]

@NgModule({
  declarations: [
    ...directives,
    ...components
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...directives,
    ...components
  ]
})
export class SharedModule { }
