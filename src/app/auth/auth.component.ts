
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { matchValues } from 'src/app/shared/form-validators';
import { NavService } from '../nav/nav.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  userForm!: FormGroup;

  type!: string;
  loading = false;

  passhide = true;
  confirmhide = true;

  serverMessage!: string;

  validationMessages: any = {
    email: {
      required: 'Email is required.',
      email: 'Email must be a valid email address.'
    },
    password: {
      required: 'Password is required.',
      pattern: 'Password must include at least one letter and one number.',
      minlength: 'Password must be at least 6 characters long.',
      maxlength: 'Password cannot be more than 25 characters long.'
    },
    confirmPassword: {
      required: 'Confirm password is required.',
      matching: 'Passwords must match.'
    }
  };

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private nav: NavService
  ) {
    // get type from route
    this.route.url.subscribe((r: any) => {
      this.type = r[0].path;
    });
    this.nav.closeLeftNav();
  }

  ngOnInit() {

    // init form controls
    const passwordControl = this.fb.control('', [
      Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
      Validators.minLength(6),
      Validators.maxLength(25),
      Validators.required
    ]);

    const confirmControl = this.fb.control('', [
      Validators.required,
      matchValues('password')
    ]);

    this.userForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
    });

    if (this.isLogin || this.isRegister) {
      this.userForm.addControl('password', passwordControl);
    }
    if (this.isRegister) {
      this.userForm.addControl('confirmPassword', confirmControl);
      // check confirm password validity
      this.userForm.controls.password.valueChanges.subscribe(
        () => this.userForm.controls.confirmPassword.updateValueAndValidity()
      );
    }
  }

  // get fields
  get email() {
    return this.userForm.get('email');
  }
  get password() {
    return this.userForm.get('password');
  }
  get confirmPassword() {
    return this.userForm.get('confirmPassword');
  }

  // define types
  get isLogin() {
    return this.type === 'login';
  }
  get isRegister() {
    return this.type === 'register';
  }
  get isReset() {
    return this.type === 'reset';
  }

  // errors
  private errorMessage(field: string) {
    const errors = this.validationMessages[field];
    for (const e of Object.keys(errors)) {
      if (this.userForm.get(field)?.hasError(e)) {
        return errors[e];
      }
    }
  }
  get passError() {
    return this.errorMessage('password');
  }
  get confirmError() {
    return this.errorMessage('confirmPassword');
  }
  get emailError() {
    return this.errorMessage('email');
  }

  async onSubmit() {

    this.loading = true;

    try {
      if (this.isLogin) {
        await this.auth.emailLogin(this.userForm.value)
      }
      if (this.isRegister) {
        await this.auth.emailSignUp(this.userForm.value)
      }
      if (this.isReset) {
        await this.auth.resetPassword(this.email?.value)
          .then((r: any) => {
            if (r.message) {
              this.serverMessage = r.message;
            }
          });
      }
    } catch (e: any) {
      this.serverMessage = e;
    }
    this.loading = false;
  }
}
