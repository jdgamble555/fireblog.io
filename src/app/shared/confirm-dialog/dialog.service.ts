import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public dialog: MatDialog) { }

  confirmDialog(msg: string): any {
    return this.dialog.open(ConfirmDialogComponent, {
      height: '',
      width: '300px',
      data: {
        message: msg
      }
    });
  }
}
