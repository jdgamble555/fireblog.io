
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { debounceTime, map, take } from 'rxjs/operators';
import { matchValidator, MyErrorStateMatcher } from 'src/app/shared/form-validators';
import { NavService } from '../nav/nav.service';
import { AuthService } from '../platform/mock/auth.service';
import { DbService } from '../platform/mock/db.service';
import { SeoService } from '../shared/seo/seo.service';
import { SnackbarService } from '../shared/snack-bar/snack-bar.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {

  matcher = new MyErrorStateMatcher();

  userForm!: FormGroup;

  routeSub: Subscription;

  type!: 'login' | 'register' | 'reset' | 'verify';
  loading = false;

  passhide = true;
  confirmhide = true;

  isLogin = false;
  isRegister = false;
  isReset = false;
  isVerify = false;
  isCreateUser = false;

  title!: string;

  messages: any = {
    email_sent: 'Your confirmation email has been sent!'
  };

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
    },
    username: {
      required: 'A valid username is required.',
      minlength: 'Username must be at least 3 characters long.',
      maxlength: 'Username cannot be more than 25 characters long.',
      unavailable: 'That username is taken.'
    }
  };

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private nav: NavService,
    private seo: SeoService,
    private sb: SnackbarService,
    private db: DbService
  ) {

    // get type from route
    this.routeSub = this.route.url.subscribe((r: any) => {
      this.type = r[0].path;
    });
    this.nav.closeLeftNav();
  }

  ngOnInit() {

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
    } else if (this.type === 'username') {
      this.isCreateUser = true;
      this.title = 'Create Username';
    }

    this.seo.generateTags({
      title: this.title + ' - ' + this.nav.title
    });
    this.nav.setBC(this.title);

    // init form controls
    const passwordControl = this.fb.control('', [
      Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
      Validators.minLength(6),
      Validators.maxLength(25),
      Validators.required
    ]);

    const confirmControl = this.fb.control('', [
      Validators.required
    ]);

    if (!this.isCreateUser && !this.isVerify) {
      this.userForm = this.fb.group({
        email: ['', [
          Validators.required,
          Validators.email
        ]]
      });
    } else {
      this.userForm = this.fb.group({
        username: ['', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(25),
        ], this.isAvailable('jdgamble555')]
      });
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
        await this.auth.emailLogin(
          this.getField('email')?.value,
          this.getField('password')?.value
        ).then(() => {
          this.router.navigate(['/settings']);
        });
      } else if (this.isRegister) {
        await this.auth.emailSignUp(
          this.getField('email')?.value,
          this.getField('password')?.value
        ).then(() => {
          this.router.navigate(['/username']);
        });;
      } else if (this.isReset) {
        const r = await this.auth.resetPassword(
          this.getField('email')?.value
        );
        if (r.message) {
          this.sb.showMsg(r.message);
        }
      } else if (this.isCreateUser) {
        const r = await this.auth.updateUsername(
          this.getField('username')?.value
        );
        if (r.message) {
          this.sb.showMsg(r.message);
          this.router.navigate(['/settings']);
        }
      }
    } catch (e: any) {
      this.sb.showError(e);
    }
    this.loading = false;
  }

  googleLogin() {
    this.auth.oAuthLogin('google.com')
      .then((isNew) => {
        isNew
          ? this.router.navigate(['/username'])
          : this.router.navigate(['/settings']);
      });
  }

  sendEmail() {
    this.auth.sendVerificationEmail();
    this.sb.showMsg(this.messages.email_sent);
  }

  isAvailable(current?: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

      const field = control.value;
      if (field === current) {
        return of(null);
      }
      return this.db.validUsername(field).pipe(
        debounceTime(500),
        take(1),
        map((f: any) => f
          ? { 'unavailable': true }
          : null
        )
      );
    }
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
}
