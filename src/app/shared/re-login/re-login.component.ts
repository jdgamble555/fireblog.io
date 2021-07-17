import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AuthService } from 'src/app/auth/auth.service';
import { SnackbarService } from '../snack-bar/snack-bar.service';

@Component({
  selector: 'app-re-login',
  templateUrl: './re-login.component.html',
  styleUrls: ['./re-login.component.scss', '../../auth/auth.component.scss']
})
export class ReLoginComponent implements OnInit {

  //reAuth: boolean = null;

  providers: any = '';

  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private d: MatDialogRef<ReLoginComponent>,
    private sb: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.providers = data.providers;
  }

  ngOnInit() {
    this.buildForm();
  }

  providerLogin(provider: string) {
    this.auth.oAuthReLogin(provider)
      .then(() => {
        this.d.close();
      });
  }

  login(): void {
    this.auth.emailLogin(this.userForm.value);
  }

  error(e: string) {
    this.sb.showError(e);
  }

  buildForm(): void {
    this.userForm = this.fb.group({
      password: ['', [
        Validators.required
      ]
      ]
    });
  }

}
