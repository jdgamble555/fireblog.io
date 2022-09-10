import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AuthAccessService } from '@db/auth/auth-access.service';
import { AuthService } from '@db/auth/auth.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';

@Component({
  selector: 'app-re-login',
  templateUrl: './re-login.component.html',
  styleUrls: ['./re-login.component.scss']
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
    private aas: AuthAccessService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.providers = data.providers;
  }

  ngOnInit() {
    this.buildForm();
  }

  async providerLogin(provider: string) {
    const { message, error } = await this.aas.oAuthReLogin(provider);
    if (message) {
      this.sb.showMsg(message);
    }
    if (error) {
      this.sb.showError(error);
    }
    this.d.close();
  }

  login(): void {
    this.auth.emailLogin(
      this.getField('email').value,
      this.getField('password').value
    );
  }

  error(e: string) {
    this.sb.showError(e);
  }

  buildForm(): void {
    this.userForm = this.fb.group({
      password: ['', [
        Validators.required
      ]]
    });
  }

  getField(field: string): AbstractControl {
    return this.userForm.get(field) as AbstractControl;
  }

}
