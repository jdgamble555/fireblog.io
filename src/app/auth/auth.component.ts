
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { matchValidator } from 'src/app/shared/form-validators';
import { NavService } from '../nav/nav.service';
import { AuthService } from '../platform/firebase/auth.service';
import { SeoService } from '../shared/seo/seo.service';
import { SnackbarService } from '../shared/snack-bar/snack-bar.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnDestroy {

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
    }
  };

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private nav: NavService,
    private seo: SeoService,
    private sb: SnackbarService
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
    }

    this.seo.generateTags({
      title: this.title + ' - ' + this.nav.title
    });

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

    this.userForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });

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
      }
      if (this.isRegister) {
        await this.auth.emailSignUp(
          this.getField('email')?.value,
          this.getField('password')?.value
        ).then(() => {
          this.router.navigate(['/settings']);
        });;
      }
      if (this.isReset) {
        const r = await this.auth.resetPassword(
          this.getField('email')?.value
        );
        if (r.message) {
          this.sb.showMsg(r.message);
        }
      }
    } catch (e: any) {
      this.sb.showError(e);
    }
    this.loading = false;
  }

  googleLogin() {
    this.auth.oAuthLogin('google.com')
      .then(() => {
        this.router.navigate(['/settings']);
      });
  }

  sendEmail() {
    this.auth.sendVerificationEmail();
    this.sb.showMsg(this.messages.email_sent);
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
}
