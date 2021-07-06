import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { ConfirmDialogComponent } from './confirm-dialog.component';



@NgModule({
  imports: [MaterialModule],
  declarations: [ConfirmDialogComponent],
  entryComponents: [ConfirmDialogComponent]
})
export class ConfirmDialogModule { }
