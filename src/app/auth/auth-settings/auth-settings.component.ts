import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { NavService } from 'src/app/nav/nav.service';
import { DialogService } from 'src/app/shared/confirm-dialog/dialog.service';
import { ImageUploadService } from 'src/app/shared/image-upload/image-upload.service';
import { SnackbarService } from 'src/app/shared/snack-bar/snack-bar.service';
import { AuthService } from '../auth.service';
import { matchValidator } from 'src/app/shared/form-validators';
import { ReLoginComponent } from 'src/app/shared/re-login/re-login.component';

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

  // providers
  providers: any;

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

    // check confirm password validity
    this.accountForm.controls.password.valueChanges.subscribe(
      () => this.accountForm.controls.confirmPassword.updateValueAndValidity()
    );
    // set email, displayName, and !photoURL from user database
    const user = await this.auth.getUser();
    this.providers = await this.auth.getProviders();
    this.accountForm.get('displayName')!.setValue(user.displayName);
    this.accountForm.get('email')!.setValue(user.email);
  }

  // get field
  getField(field: string) {
    return this.accountForm.get(field);
  }

  // errors
  getError(field: string) {
    const errors = this.validationMessages[field];
    for (const e of Object.keys(errors)) {
      if (this.accountForm.get(field)?.hasError(e)) {
        return errors[e];
      }
    }
  }
  /**
   * Builds the account form control
   */
  buildAccountForm(): void {
    this.accountForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
          Validators.minLength(6),
          Validators.maxLength(25)
        ]
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          matchValidator('password')
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      displayName: ['', [Validators.required]],
      photoURL: []
    });
  }
  /**
   * Updates the user profile name and photo URL
   */
  updateProfile() {
    // update displayName
    this.auth
      .updateProfile({ displayName: this.accountForm.value.displayName })
      .catch((e: any) => this.sb.showError(e))
      .then((r: any) => this.sb.showMsg(r.message));
  }
  /**
   * Toggle's a user's provider
   * @param e element reference
   * @param p provider
   */
  updateProvider(e: any, p: any) {
    try {
      if (e.checked) {
        this.auth.addProvider(p)
          .then((r) => this.sb.showMsg(r.message));
      } else {
        this.auth.removeProvider(p)
          .then((r) => this.sb.showMsg(r.message));
      }
    } catch (e: any) {
      this.sb.showError(e);
    }
  }
  /**
   * Updates the user's email address
   */
  updateEmail() {
    this.auth.updateEmail(this.accountForm.value.email)
      .then((r: any) => this.sb.showMsg(r.message))
      .catch(async (e: any) => {
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
      })
  }
  /**
   * Updates the user's password
   */
  updatePass() {
    this.auth.updatePass(this.accountForm.value.password)
      .then((r: any) => {
        this.sb.showMsg(r.message);
        this.accountForm.reset();
        this.passFormDirective.resetForm();
      })
      .catch(async (e: any) => {
        if (e.code === 'auth/requires-recent-login') {
          const ra = await this.reAuth();
          ra.afterClosed()
            .subscribe((closed: any) => {
              if (!closed) {
                this.updatePass();
              }
            });
        } else {
          this.sb.showError(e);
        }
      });
  }
  /**
   * Delete the user's account
   */
  deleteAccount(): void {
    // display confirm dialog
    let confirm = this.dialog.confirmDialog(this.messages.deleteAccount);
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
  private deleteUser(): void {
    // delete profile image
    this.deleteImage().then(() =>
      // delete user
      this.auth.deleteUser()
        .catch(async (e: any) => {
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
        })
    ).then(() => this.auth.logout());
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
    /*return this.is.deleteImage(url)
      .catch((e: any) => {
        // ignore invalid file type error
        if (e.code === 'storage/invalid-argument') {
          return;
        }
      })
      .then(() => this.auth.updateProfile({ photoURL: null }));*/
  }
  /**
   * Upload profile image
   * @param event file event
   */
  async uploadImage(event: any) {

    const event$: FileList = event.target?.files
      ? event.target.files
      : event;
    const file = event$.item(0);

    const user = await this.auth.getUser();
    const uid = user!.uid || '';

    // delete current profile image
    this.deleteImage()
      .then(() =>
        // upload new image and save it to profile image
        this.is.uploadImage('profile_images', uid, file)
          .catch((e: any) => {
            if (e.code === 'image/file-type') {
              this.sb.showError(this.messages.selectImage);
            }
          })
          .then((image: string | void) => this.auth.updateProfile({ photoURL: image })))
      .catch((e: any) => this.sb.showError(e));
  }

}
