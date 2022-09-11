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
import { UserRec } from '@auth/user.model';
import { DialogService } from '@shared/confirm-dialog/dialog.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { matchValidator, MyErrorStateMatcher } from '@shared/form-validators';
import { NavService } from '@nav/nav.service';
import { auth_settings_messages, auth_settings_validation_messages } from './auth-settings.messages';
import { ImageUploadService } from '@db/image/image-upload.service';
import { UserDbService } from '@db/user/user-db.service';
import { UserEditService } from '@db/user/user-edit.service';
import { AuthEditService } from '@db/auth/auth-edit.service';

@Component({
  selector: 'app-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss']
})
export class AuthSettingsComponent implements OnInit {

  @ViewChild(FormGroupDirective) private passFormDirective!: FormGroupDirective;

  messages = auth_settings_messages;
  validationMessages = auth_settings_validation_messages;

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
    private us: UserDbService,
    private ues: UserEditService
  ) {
    this.nav.closeLeftNav();
    this.nav.addTitle('Settings');
  }

  async ngOnInit() {

    // build forms
    this.buildAccountForm();

    // get user info
    this.us.getUserRec()
      .then(async (user: UserRec | null) => {
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
          this.auth.getUser().then(user => {
            if (user) {
              this.emailVerified = user?.emailVerified;
            }
          });

          // get providers
          this.providers = await this.auth.getProviders() as string[];

        } else {
          this.router.navigate(['/login']);
        }
      });
  }

  sendEmail() {
    this.auth.sendVerificationEmail();
    this.sb.showMsg(this.messages.email_sent);
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
    const r = await this.aes.updateProfile({
      displayName
    });
    this.currentDisplayName = displayName;
    if (r.message) {
      this.sb.showMsg(r.message);
    }
    if (r.error) {
      this.sb.showError(r.error);
    }
  }

  async updateUsername() {

    const username = this.getField('username').value;
    // update username
    const r = await this.ues.updateUsername(username, this.currentUsername);
    if (r.message) {
      this.currentUsername = username;
      this.sb.showMsg(r.message);
    }
    if (r.error) {
      this.sb.showError(r.error);
    }
  }

  async updateEmail() {

    // update email
    const email = this.getField('email').value;
    const { reAuth, error, message } = await this.aes.updateEmail(email);
    this.currentEmail = email;
    if (message) {
      this.sb.showMsg(message);
    }
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
      }
    }
  }
  /**
   * Updates the user's password
   */
  async updatePass() {

    const { reAuth, message, error } = await this.aes.updatePass(this.accountForm.value.password);
    if (message) {
      this.sb.showMsg(message);
    }
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

  async usernameTest(field: string) {
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
      r = await this.aes.removeProvider(p);
    }
    if (r.message) {
      this.sb.showMsg(r.message);
    }
    if (r.error) {
      this.sb.showError(r.error);
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
      .subscribe((confirmed: any) => {
        if (confirmed) {
          this.deleteUser();
        }
      });
  }
  /**
   * Deletes the user info
   */
  private async deleteUser(): Promise<void> {

    // delete profile image
    await this.deleteImage();
    const { reAuth, error, message } = await this.aes.deleteUser();
    if (message) {
      this.sb.showMsg(message);
    }
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
      }
    }
    this.auth.logout();
  }
  /**
   * Reauthenticate the user with a dialog
   */
  private async reAuth(): Promise<any> {
    // open reauth dialog with providers
    return this.d.open(ReLoginComponent, {
      width: '300px',
      height: '',
      panelClass: 'reAuthDialog',
      disableClose: true,
      data: {
        providers: await this.auth.getProviders()
      }
    });
  }
  /**
   * Toggle is hovering
   * @param event event
   */
  toggleHover(event: any) {
    this.isHovering = event;
  }
  /**
   * Delete the profile image
   */
  async deleteImage() {

    // remove from storage bucket
    const user = await this.auth.getUser();
    const url = user?.photoURL || '';

    // delete the image from url
    try {
      await this.is.deleteImage(url);
      await this.aes.updateProfile({ photoURL: null });
    } catch (e: any) {
      this.sb.showError(e);
    }
  }
  /**
   * Upload profile image
   * @param event file event
   */
  async uploadImage(event: any) {

    // get image file
    const event$: FileList = event.target?.files
      ? event.target.files
      : event;
    const file = event$.item(0);

    if (file) {

      // convert to jpeg
      const image = this.is.blobToFile(file, file?.name);

      const user = await this.auth.getUser();
      const uid = user?.uid;

      let imageURL;
      try {
        imageURL = await this.is.uploadImage('profile_images', image, uid);
      } catch (e: any) {
        if (e.code === 'image/file-type') {
          this.sb.showError(this.messages.selectImage);
        }
        console.error(e);
      }
      // upload new image and save it to photoURL in user db
      await this.aes.updateProfile({ photoURL: imageURL });
    }
  }

  onOpen() {
    this.accountForm.markAsUntouched();
  }

  logout() {
    this.auth.logout();
    this.nav.home();
  }
}
