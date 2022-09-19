import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { MaterialModule } from 'src/app/core/material.module';
import { ConfirmDialogComponent } from './confirm-dialog.component';
@NgModule({
  imports: [
    SharedModule,
    MaterialModule
  ],
  declarations: [ConfirmDialogComponent]
})
export class ConfirmDialogModule { }
