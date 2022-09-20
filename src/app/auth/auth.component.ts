import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@db/auth/auth.service';
import { NavService } from '@nav/nav.service';
import { matchValidator, MyErrorStateMatcher } from '@shared/form-validators';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { auth_messages, auth_validation_messages } from './auth.messages';
import { AuthAction } from './user.model';

enum AuthType {
  login = 'login',
  register = 'register',
  reset = 'reset',
  verify = 'verify',
  passwordless = 'passwordless'
};

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  matcher = new MyErrorStateMatcher();
  validationMessages: any = auth_validation_messages;
  messages = auth_messages;

  userForm!: FormGroup;

  type!: AuthType;
  loading = false;

  passhide = true;
  confirmhide = true;

  isLogin = false;
  isRegister = false;
  isReset = false;
  isVerify = false;
  isPasswordless = false;
  isReturnLogin = false;

  title!: string;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private nav: NavService,
    private sb: SnackbarService
  ) {

    // get type from route
    this.type = this.route.parent?.routeConfig?.path as AuthType;
    this.nav.closeLeftNav();
  }

  async ngOnInit() {

    // define types
    if (this.type === 'login') {
      this.isLogin = true;
      this.title = 'Login';
    } else if (this.type === 'register') {
      this.isRegister = true;
      this.title = 'Register';
    } else if (this.type === 'reset') {
      this.isReset = true;
      this.title = 'Forgot Password';
    } else if (this.type === 'verify') {
      this.isVerify = true;
      this.title = 'Verify Email Address';
    } else if (this.type === 'passwordless') {
      this.isPasswordless = true;
      this.title = 'Passwordless Login';
    } else if (this.type === '_login') {
      const url = this.router.url;
      // signin with link
      const { isConfirmed, error } = await this.auth.confirmSignIn(url)
      isConfirmed
        ? this.router.navigate(['/dashboard'])
        : null;
      if (error) {
        this.sb.showError(error);
      } else {
        this.sb.showMsg(this.messages.sendEmailLink);
      }
      this.isReturnLogin = true;
      this.title = 'Passwordless Login';
    }

    this.nav.addTitle(this.title);

    // init form controls
    const emailControl = this.fb.control('', [
      Validators.required,
      Validators.email
    ]);

    const passwordControl = this.fb.control('', [
      Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
      Validators.minLength(6),
      Validators.maxLength(25),
      Validators.required
    ]);

    const confirmControl = this.fb.control('', [
      Validators.required
    ]);

    this.userForm = this.fb.group({});

    if (!this.isVerify) {
      this.userForm.addControl('email', emailControl);
    }

    if (this.isLogin || this.isRegister) {
      this.userForm.addControl('password', passwordControl);
    }
    if (this.isRegister) {
      this.userForm.addControl('confirmPassword', confirmControl);
      this.getField('confirmPassword')?.addValidators(
        matchValidator('password')
      );
      this.getField('password')?.addValidators(
        matchValidator('confirmPassword', true)
      );
    }
  }

  // get field
  getField(field: string): AbstractControl<any, any> | null {
    return this.userForm.get(field);
  }

  // get error
  getError(field: string): any {
    const errors = this.validationMessages[field];
    if (errors) {
      for (const e of Object.keys(errors)) {
        if (this.userForm.get(field)?.hasError(e)) {
          return errors[e];
        }
      }
    }
  }

  async onSubmit(): Promise<void> {

    this.loading = true;
    let message = null;
    let r: AuthAction | null = null;

    if (this.isLogin) {
      r = await this.auth.emailLogin(
        this.getField('email')?.value,
        this.getField('password')?.value
      );
      message = this.messages.loginSuccess;
    } else if (this.isRegister) {
      r = await this.auth.emailSignUp(
        this.getField('email')?.value,
        this.getField('password')?.value
      );
      message = this.messages.accountCreated;
    } else if (this.isReset) {
      r = await this.auth.resetPassword(
        this.getField('email')?.value
      );
      message = this.messages.resetPassword;
    } else if (this.isPasswordless) {
      r = await this.auth.sendEmailLink(
        this.getField('email')?.value
      );
      message = this.messages.sendEmailLink;
    } else if (this.isReturnLogin) {
      const url = this.router.url;
      r = await this.auth.confirmSignIn(
        url,
        this.getField('email')?.value,
      );
      message = this.messages.loginSuccess;
    }
    if (r) {
      if (r.error) {
        this.sb.showError(r.error);
      } else if (message) {
        this.sb.showMsg(message);
        if (this.isLogin || this.isRegister || this.isReturnLogin) {
          this.router.navigate(['/dashboard']);
        } else if (this.isPasswordless) {
          this.router.navigate(['/login']);
        }
      }
    }
    this.loading = false;
  }

  async providerLogin(provider: string): Promise<void> {
    const { error, isNew } = await this.auth.oAuthLogin(provider);
    isNew
      ? this.router.navigate(['/username'])
      : this.router.navigate(['/dashboard']);
    if (error) {
      this.sb.showError(error);
    } else {
      this.sb.showMsg(this.messages.loginSuccess);
    }
  }

  async sendEmail(): Promise<void> {
    const { error } = await this.auth.sendVerificationEmail();
    if (error) {
      this.sb.showError(error);
    } else {
      this.sb.showMsg(this.messages.emailVerifySent);
    }
  }
}
