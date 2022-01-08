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
import { firstValueFrom, Observable, of, Subscription } from 'rxjs';
import { NavService } from 'src/app/nav/nav.service';
import { DialogService } from 'src/app/shared/confirm-dialog/dialog.service';
import { SnackbarService } from 'src/app/shared/snack-bar/snack-bar.service';
import { matchValidator, MyErrorStateMatcher } from 'src/app/shared/form-validators';
import { ReLoginComponent } from 'src/app/auth/auth-settings/re-login/re-login.component';
import { debounceTime, map, take } from 'rxjs/operators';
import { ImageUploadService } from 'src/app/platform/firebase/image-upload.service';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { ReadService } from 'src/app/platform/firebase/read.service';
import { DbService } from 'src/app/platform/firebase/db.service';
import { Router } from '@angular/router';
import { UserRec } from '../user.model';

@Component({
  selector: 'app-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss']
})
export class AuthSettingsComponent implements OnInit {

  @ViewChild(FormGroupDirective) private passFormDirective!: FormGroupDirective;

  matcher = new MyErrorStateMatcher();

  uploadPercent: Observable<number> | any = '';
  isHovering = false;
  hasPassword = false;

  passhide = true;
  confirmhide = true;

  currentUsername!: string;
  currentEmail!: string;
  currentDisplayName!: string;
  isVerified!: boolean;

  passSub!: Subscription;

  providers!: any;

  messages: any = {
    deleteAccount: 'Are you sure you want to delete your account?',
    selectImage: 'You must choose an image file type.',
    email_sent: 'Your confirmation email has been sent!'
  }

  validationMessages: any = {
    email: {
      required: 'Email is required.',
      email: 'Email must be a valid email address.'
    },
    password: {
      required: 'New Password is required.',
      pattern: 'New Password must include at least one letter and one number.',
      minlength: 'New Password must be at least 6 characters long.',
      maxlength: 'New Password cannot be more than 25 characters long.'
    },
    confirmPassword: {
      required: 'Confirm New Password is required.',
      matching: 'Passwords must match.'
    },
    displayName: {
      required: 'Name is required.'
    },
    username: {
      required: 'A valid username is required.',
      minlength: 'Username must be at least 3 characters long.',
      maxlength: 'Username cannot be more than 25 characters long.',
      unavailable: 'That username is taken.'
    }
  };

  accountForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private sb: SnackbarService,
    public auth: AuthService,
    private dialog: DialogService,
    private d: MatDialog,
    private nav: NavService,
    public is: ImageUploadService,
    private read: ReadService,
    private db: DbService,
    private router: Router
  ) {
    this.nav.closeLeftNav();
    this.nav.addTitle('Settings');
  }

  async ngOnInit() {

    // build forms
    this.buildAccountForm();

    // get user info
    firstValueFrom(this.read.userRec)
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
              this.isVerified = user?.emailVerified;
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
  getError(field: string): string[] {
    const errors = this.validationMessages[field];
    for (const e of Object.keys(errors)) {
      if (this.accountForm.get(field)?.hasError(e)) {
        return errors[e];
      }
    }
    return [];
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
    try {
      const displayName = this.getField('displayName').value;
      const r = await this.auth.updateProfile({
        displayName
      });
      this.currentDisplayName = displayName;
      this.sb.showMsg(r.message);
    } catch (e: any) {
      this.sb.showError(e);
    }
  }

  async updateUsername() {

    const username = this.getField('username').value;

    // update username
    const r = await this.auth.updateUsername(username, this.currentUsername);
    if (r.message) {
      this.currentUsername = username;
      this.sb.showMsg(r.message);
    }
  }

  async updateEmail() {

    // update email
    const email = this.getField('email').value;
    try {
      const r = await this.auth.updateEmail(email);
      this.currentEmail = email;
      this.sb.showMsg(r.message);
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        const ra = await this.reAuth();
        // update code here
        ra.afterClosed()
          .subscribe((closed: any) => {
            if (!closed) {
              this.updateEmail();
            }
          });
      } else {
        this.sb.showError(e);
      }
    }
  }
  /**
   * Updates the user's password
   */
  async updatePass() {
    try {
      const r = await this.auth.updatePass(this.accountForm.value.password);
      this.sb.showMsg(r.message);
      this.accountForm.reset();
      this.passFormDirective.resetForm();
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        const ra = await this.reAuth();
        // update code here
        ra.afterClosed()
          .subscribe((closed: any) => {
            if (!closed) {
              this.updatePass();
            }
          });
      } else {
        this.sb.showError(e);
      }
    }
  }

  isAvailable(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const field = control.value;
      if (field === this.currentUsername) {
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

  /**
   * Toggle's a user's provider
   * @param e element reference
   * @param p provider
   */
  async updateProvider(e: any, p: any): Promise<void> {
    try {
      if (e.checked) {
        const r = await this.auth.addProvider(p);
        this.sb.showMsg(r.message);
      } else {
        const r = await this.auth.removeProvider(p);
        this.sb.showMsg(r.message);
      }
    } catch (e: any) {
      this.sb.showError(e);
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
    try {
      await this.deleteImage();
      await this.auth.deleteUser();
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        const ra = await this.reAuth();
        ra.afterClosed()
          .subscribe((closed: any) => {
            if (!closed) {
              this.updateEmail();
            }
          });
      } else {
        this.sb.showError(e);
      }
      this.auth.logout();
    }
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
    } catch (e: any) {
      // when there is no previous image to delete
      if (e.code === 'storage/invalid-argument') {
        return;
      }
      await this.auth.updateProfile({ photoURL: null });
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
      await this.auth.updateProfile({ photoURL: imageURL });
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
