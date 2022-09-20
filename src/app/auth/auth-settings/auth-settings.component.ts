import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormGroupDirective,
  AbstractControl,
  ValidatorFn
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { from, Observable, of, Subscription } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '@db/auth/auth.service';
import { ReLoginComponent } from './re-login/re-login.component';
import { DialogService } from '@shared/confirm-dialog/dialog.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { matchValidator, MyErrorStateMatcher } from '@shared/form-validators';
import { NavService } from '@nav/nav.service';
import {
  auth_settings_errors,
  auth_settings_messages,
  auth_settings_validation_messages
} from './auth-settings.messages';
import { ImageUploadService } from '@db/image/image-upload.service';
import { UserDbService } from '@db/user/user-db.service';
import { UserEditService } from '@db/user/user-edit.service';
import { AuthEditService } from '@db/auth/auth-edit.service';
import { blobToFile } from '@shared/image-tools/image-tools';
import { username_validation_messages } from '@auth/username/username.messages';

@Component({
  selector: 'app-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss']
})
export class AuthSettingsComponent implements OnInit {

  @ViewChild(FormGroupDirective) private passFormDirective!: FormGroupDirective;

  messages = auth_settings_messages;
  validationMessages = { ...auth_settings_validation_messages, ...username_validation_messages };
  errors = auth_settings_errors;

  matcher = new MyErrorStateMatcher();

  uploadPercent: Observable<number> | any = '';
  isHovering = false;
  hasPassword = false;

  passhide = true;
  confirmhide = true;

  currentUsername!: string;
  currentEmail!: string;
  currentDisplayName!: string;
  emailVerified!: boolean | null;

  passSub!: Subscription;
  providers!: any;
  accountForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sb: SnackbarService,
    public auth: AuthService,
    private aes: AuthEditService,
    private dialog: DialogService,
    private d: MatDialog,
    private nav: NavService,
    public is: ImageUploadService,
    private router: Router,
    public us: UserDbService,
    private ues: UserEditService
  ) {
    this.nav.closeLeftNav();
    this.nav.addTitle('Settings');
  }

  async ngOnInit() {

    // build forms
    this.buildAccountForm();

    // get user info
    const { error, data: user } = await this.us.getUser();
    if (error) {
      console.error(error);
    }
    if (user) {
      const username = user?.username;
      const displayName = user?.displayName;
      const email = user?.email;
      if (username) {
        this.currentUsername = username;
        this.getField('username').setValue(username);
      }
      if (displayName) {
        this.currentDisplayName = displayName;
        this.getField('displayName').setValue(user!.displayName);
      }
      if (email) {
        this.currentEmail = email;
        this.getField('email').setValue(user!.email);
      }

      // get email verified
      if (user) {
        this.emailVerified = user?.emailVerified || null;
      }

      // get providers
      this.providers = user.providers;

    } else {
      this.router.navigate(['/login']);
    }
  }

  async sendEmail() {
    const { error } = await this.auth.sendVerificationEmail();
    if (error) {
      console.error(error);
    } else {
      this.sb.showMsg(this.messages.emailVerifySent);
    }
  }

  isProvider(p: string) {
    return this.providers ? this.providers.includes(p) : false;
  }

  // get field
  getField(field: string): AbstractControl {
    return this.accountForm.get(field) as AbstractControl;
  }

  // errors
  getError(field: string): any {
    const errors = this.validationMessages[field];
    if (errors) {
      for (const e of Object.keys(errors)) {
        if (this.accountForm.get(field)?.hasError(e)) {
          return errors[e];
        }
      }
    }
  }
  /**
   * Builds the account form control
   */
  buildAccountForm(): void {
    this.accountForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.minLength(6),
        Validators.maxLength(25),
        matchValidator('confirmPassword', true)
      ]],
      confirmPassword: ['', [
        Validators.required,
        matchValidator('password')
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      displayName: ['', [
        Validators.required
      ]],
      photoURL: [],
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25),
      ], this.isAvailable()
      ]
    });
  }

  //
  // Profile
  //

  async updateProfile() {
    // update displayName
    const displayName = this.getField('displayName').value;
    const { error } = await this.aes.updateProfile({ displayName });
    if (error) {
      this.sb.showError(error);
    } else {
      this.currentDisplayName = displayName;
      this.sb.showMsg(this.messages.profileUpdated);
    }
  }

  async updateUsername() {
    // update username
    const username = this.getField('username').value;
    const { error } = await this.ues.updateUsername(username, this.currentUsername);
    if (error) {
      this.sb.showError(error);
    } else {
      this.currentUsername = username;
      this.sb.showMsg(this.messages.usernameUpdated);
    }
  }

  async updateEmail() {
    // update email
    const email = this.getField('email').value;
    const { reAuth, error } = await this.aes.updateEmail(email);
    this.currentEmail = email;
    if (reAuth) {
      const ra = await this.reAuth();
      // update code here
      ra.afterClosed()
        .subscribe((closed: any) => {
          if (!closed) {
            this.updateEmail();
          }
        });
    } else {
      if (error) {
        this.sb.showError(error);
      } else {
        this.currentEmail = email;
        this.sb.showMsg(this.messages.emailUpdated);
      }
    }
  }
  async updatePass(): Promise<void> {
    // update password
    const { reAuth, error } = await this.aes.updatePass(this.accountForm.value.password);
    this.accountForm.reset();
    this.passFormDirective.resetForm();
    if (reAuth) {
      const ra = await this.reAuth();
      // update code here
      ra.afterClosed()
        .subscribe((closed: any) => {
          if (!closed) {
            this.updatePass();
          }
        });
    } else {
      if (error) {
        this.sb.showError(error);
      } else {
        this.sb.showMsg(this.messages.passUpdated);
      }
    }
  }

  isAvailable(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const field = control.value;
      if (field === this.currentUsername) {
        return of(null);
      }
      return from(this.usernameTest(field)).pipe(
        debounceTime(500),
        take(1)
      );
    }
  }

  async usernameTest(field: string): Promise<any | null> {
    const { data, error } = await this.ues.validUsername(field);
    if (error) {
      console.error(error);
    }
    return data ? { 'unavailable': true } : null;
  }


  /**
   * Toggle's a user's provider
   * @param e element reference
   * @param p provider
   */
  async updateProvider(e: any, p: any): Promise<void> {
    let r = null;
    if (e.checked) {
      r = await this.aes.addProvider(p);
    } else {
      // can't remove if only provider
      const providers = (await this.us.getUser()).data?.providers;
      if (providers && providers.length < 2) {
        this.sb.showError(this.errors.removeProvider);
      } else {
        r = await this.aes.removeProvider(p);
      }
    }
    if (r?.error) {
      this.sb.showError(r.error);
    } else {
      this.sb.showMsg(this.messages.profileUpdated);
    }
  }
  /**
   * Delete the user's account
   */
  async deleteAccount(): Promise<void> {
    // display confirm dialog
    const confirm = this.dialog.confirmDialog(this.messages.deleteAccount);
    // delete when confirmed
    confirm.afterClosed()
      .subscribe(async (confirmed: any) => {
        if (confirmed) {
          await this.deleteUser();
        }
      });
  }
  /**
   * Deletes the user info
   */
  private async deleteUser(): Promise<void> {

    // delete profile image
    await this.deleteImage();
    const { reAuth, error } = await this.aes.deleteUser();
    if (reAuth) {
      const ra = await this.reAuth();
      ra.afterClosed()
        .subscribe((closed: any) => {
          if (!closed) {
            this.updateEmail();
          }
        });
    } else {
      if (error) {
        this.sb.showError(error);
      } else {
        this.sb.showMsg(this.messages.accountRemoved);
      }
    }
    this.us.logout();
  }
  /**
   * Reauthenticate the user with a dialog
   */
  private async reAuth(): Promise<any> {
    const providers = (await this.us.getUser()).data?.providers;
    // open reauth dialog with providers
    return this.d.open(ReLoginComponent, {
      width: '300px',
      height: '',
      panelClass: 'reAuthDialog',
      disableClose: true,
      data: {
        providers
      }
    });
  }
  /**
   * Toggle is hovering
   * @param event event
   */
  toggleHover(event: any): void {
    this.isHovering = event;
  }
  /**
   * Delete the profile image
   */
  async deleteImage(): Promise<void> {

    // remove from storage bucket
    const { data: user, error } = await this.us.getUser();
    if (error) {
      console.error(error);
    }
    const url = user?.photoURL || '';

    // delete the image from url
    try {
      const { error: _ee } = await this.is.deleteImage(url);
      const { error: _e } = await this.aes.updateProfile({ photoURL: '' });
      if (_e) {
        throw _e;
      }
      if (_ee) {
        throw _ee;
      }
    } catch (e: any) {
      this.sb.showError(e);
    }
  }
  /**
   * Upload profile image
   * @param event file event
   */
  async uploadImage(event: any): Promise<void> {

    // get image file
    const event$: FileList = event.target?.files
      ? event.target.files
      : event;
    const file = event$.item(0);

    if (file) {

      // convert to jpeg
      const image = blobToFile(file, file?.name);

      let { data: user, error } = await this.us.getUser();
      const uid = user?.uid;

      let imageURL;
      try {
        ({ data: imageURL, error } = await this.is.uploadImage('profile_images', image, uid));
        if (error) {
          throw error;
        }
      } catch (e: any) {
        if (e.code === 'image/file-type') {
          this.sb.showError(this.messages.selectImage);
        }
        console.error(e);
      }
      // upload new image and save it to photoURL in user db
      const { error: _e } = await this.aes.updateProfile({ photoURL: imageURL });
      if (_e) {
        console.error(_e);
      }
    }
  }

  onOpen(): void {
    this.accountForm.markAsUntouched();
  }

  logout(): void {
    this.us.logout();
    this.nav.home();
  }
}
