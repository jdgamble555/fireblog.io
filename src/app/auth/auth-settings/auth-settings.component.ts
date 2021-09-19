import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { NavService } from 'src/app/nav/nav.service';
import { DialogService } from 'src/app/shared/confirm-dialog/dialog.service';
import { ImageUploadService } from 'src/app/platform/firebase/image-upload.service';
import { SnackbarService } from 'src/app/shared/snack-bar/snack-bar.service';

import { matchValidator } from 'src/app/shared/form-validators';
import { ReLoginComponent } from 'src/app/auth/auth-settings/re-login/re-login.component';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss']
})
export class AuthSettingsComponent implements OnInit {

  @ViewChild(FormGroupDirective) private passFormDirective!: FormGroupDirective;

  uploadPercent: Observable<number> | any = '';
  isHovering = false;
  hasPassword = false;

  passhide = true;
  confirmhide = true;

  passSub!: Subscription;

  providers!: any;

  messages: any = {
    deleteAccount: 'Are you sure you want to delete your account?',
    selectImage: 'You must choose an image file type.'
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
    public is: ImageUploadService
  ) {
    this.nav.closeLeftNav();
  }

  async ngOnInit() {

    // build forms
    this.buildAccountForm();

    // get user info
    const user = await this.auth.user$.pipe(take(1)).toPromise();
    this.providers = await this.auth.getProviders() as string[];

    // patch values
    this.getField('displayName').setValue(user!.displayName);
    this.getField('email').setValue(user!.email);
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
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', [Validators.required]],
      photoURL: []
    });
  }

  //
  // Profile
  //
  async updateProfile() {

    // update displayName
    try {
      const r = await this.auth.updateProfile({
        displayName: this.accountForm.value.displayName
      });
      this.sb.showMsg(r.message);
    } catch (e: any) {
      this.sb.showError(e);
    }
  }

  async updateEmail() {

    // update email
    try {
      const r = await this.auth.updateEmail(this.accountForm.value.email);
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
      }
      // upload new image and save it to photoURL in user db
      await this.auth.updateProfile({ photoURL: imageURL });
    }
  }
}
