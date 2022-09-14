import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import { UserEditService } from '@db/user/user-edit.service';
import { NavService } from '@nav/nav.service';
import { MyErrorStateMatcher } from '@shared/form-validators';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { from, of } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { username_messages, username_validation_messages } from './username.messages';


@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss']
})
export class UsernameComponent {

  matcher = new MyErrorStateMatcher();

  validationMessages = username_validation_messages;
  messages = username_messages;

  userForm!: FormGroup;

  loading = false;

  passhide = true;
  confirmhide = true;

  isLogin = false;
  isRegister = false;
  isReset = false;
  isVerify = false;
  isCreateUser = false;
  isPasswordless = false;
  isReturnLogin = false;

  title!: string;

  constructor(
    private fb: FormBuilder,
    private nav: NavService,
    private sb: SnackbarService,
    private ues: UserEditService
  ) {
    this.nav.closeLeftNav();
    this.userForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25),
      ], this.isAvailable()]
    });
    this.isCreateUser = true;
    this.title = 'Create Username';

    this.nav.addTitle(this.title);
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

    const username = (this.getField('username')?.value as string).toLowerCase();
    const { error } = await this.ues.updateUsername(username);

    if (error) {
        console.error(error);
    } else {
      this.sb.showMsg(this.messages.usernameCreated);
    }
    this.loading = false;
  }

  isAvailable(current?: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

      const field = control.value;
      if (field === current) {
        return of(null);
      }
      return from(this.usernameTest(field)).pipe(
        debounceTime(500),
        take(1)
      );
    }
  }

  async usernameTest(field: string) {
    const { data, error } = await this.ues.validUsername(field);
    if (error) {
      console.error(error);
    }
    return data ? { 'unavailable': true } : null;
  }
}
