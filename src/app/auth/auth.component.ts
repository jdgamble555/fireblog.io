
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { matchValidator } from 'src/app/shared/form-validators';
import { NavService } from '../nav/nav.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {

  userForm!: FormGroup;

  passSub!: Subscription;

  type!: 'login' | 'register' | 'reset';
  loading = false;

  passhide = true;
  confirmhide = true;

  isLogin = false;
  isRegister = false;
  isReset = false;

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

    // define types
    if (this.type === 'login') {
      this.isLogin = true;
    } else if (this.type === 'register') {
      this.isRegister = true;
    } else if (this.type === 'reset') {
      this.isReset = true;
    }

    // init form controls
    const passwordControl = this.fb.control('', [
      Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
      Validators.minLength(6),
      Validators.maxLength(25),
      Validators.required
    ]);

    const confirmControl = this.fb.control('', [
      Validators.required,
      matchValidator('password')
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
      this.passSub = this.userForm.controls.password.valueChanges.subscribe(
        () => this.userForm.controls.confirmPassword.updateValueAndValidity()
      );
    }
  }

  // get field
  getField(field: string) {
    return this.userForm.get(field);
  }

  // get error
  getError(field: string) {
    const errors = this.validationMessages[field];
    for (const e of Object.keys(errors)) {
      if (this.userForm.get(field)?.hasError(e)) {
        return errors[e];
      }
    }
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
        await this.auth.resetPassword(this.getField('email')?.value)
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

  async googleLogin() {
    await this.auth.oAuthLogin('google.com');
  }

  ngOnDestroy() {
    this.passSub.unsubscribe();
  }

}
