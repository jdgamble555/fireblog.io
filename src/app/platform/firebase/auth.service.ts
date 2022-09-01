import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import {
  Auth,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  getAdditionalUserInfo,
  OAuthProvider,
  linkWithPopup,
  unlink,
  updateEmail,
  updatePassword,
  reauthenticateWithPopup,
  User,
  user,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from '@angular/fire/auth';
import { Role, UserAuth } from '@auth/user.model';
import { firstValueFrom, map, Observable } from 'rxjs';
import { DbService } from './db.service';

export interface AuthAction {
  reAuth?: boolean | null;
  isNew?: boolean | null;
  isConfirmed?: boolean | null;
  error: string | null;
  message: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<UserAuth | null>;

  private messages = {
    accountRemoved: 'Your account has been deleted and you have been logged out.',
    emailUpdated: 'Your Email Address has been updated.',
    emailVerifySent: 'A verification email has been sent.',
    passUpdated: 'Your Password has been updated.',
    profileUpdated: 'Your Profile has been updated.',
    providerRemoved: '{0} has been removed from the account.',
    resetPassword: 'Your password reset link has been sent.',
    usernameUpdated: 'Your username has been updated!',
    sendEmailLink: 'Your email login link has been sent.',
    loginSuccess: 'You have been successfully logged in!',
    emailConfirm: 'Your email has been confirmed!'
  };

  private errors = {
    removeProvider: 'You must have at least one linked account or password.',
    updateProfile: 'Your profile could not be updated.'
  };

  constructor(
    private auth: Auth,
    private db: DbService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.user$ = this._user();
  }

  private _user(): Observable<UserAuth | null> {
    return user(this.auth).pipe(
      map((u: User | null) => {
        return u
          ? ({
            uid: u?.uid,
            email: u?.email,
            emailVerified: u?.emailVerified,
            photoURL: u?.photoURL,
            phoneNumber: u?.phoneNumber,
            displayName: u?.displayName
          } as UserAuth)
          : null
      })
    )
  }

  private async _fbUser(): Promise<User | null> {
    return await firstValueFrom(user(this.auth));
  }

  async getUser(): Promise<UserAuth | null> {
    return await firstValueFrom(this.user$);
  }

  //
  // Login
  //

  async emailLogin(email: string, password: string): Promise<AuthAction> {

    let error = null;
    let message = null;
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const userData = {
        email,
        role: Role.Author
      };

      // create user in db
      await this.db.createUser(userData, credential.user.uid);
      message = this.messages.loginSuccess;
    } catch (e: any) {
      error = e;
    }
    return { error, message };
  }

  async emailSignUp(email: string, password: string): Promise<AuthAction> {
    let error = null;
    let message = null;
    try {
      // create user, add name, send email verification
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      if (credential.user) {
        await updateProfile(credential.user, { displayName: credential.user.displayName });
        await sendEmailVerification(credential.user);
        const userData = {
          email,
          role: Role.Author
        };
        // create user in db
        await this.db.createUser(userData, credential.user.uid);
        message = this.messages.loginSuccess;
      }
    } catch (e: any) {
      error = e;
    }
    return { message, error };
  }

  async sendEmailLink(email: string): Promise<AuthAction> {
    let message = null;
    let error = null;
    const actionCodeSettings = {
      // Your redirect URL
      url: this.doc.location.origin + '/_login',
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(
        this.auth,
        email,
        actionCodeSettings
      );
      this.doc.defaultView?.localStorage.setItem('emailForSignIn', email);
      message = this.messages.sendEmailLink;
    } catch (e: any) {
      error = e;
    }
    return { message, error };
  }

  async confirmSignIn(url: string, email?: string): Promise<AuthAction> {
    let error = null;
    let message = null;
    let isConfirmed = false;
    if (!email) {
      email = this.doc.defaultView?.localStorage.getItem('emailForSignIn') || undefined;
    }
    try {
      if (isSignInWithEmailLink(this.auth, url)) {

        // Signin user and remove the email localStorage
        if (email) {
          const r = await signInWithEmailLink(this.auth as any, email, url)
          this.doc.defaultView?.localStorage.removeItem('emailForSignIn');
          await this.auth.updateCurrentUser(r.user);
          isConfirmed = true;
          message = this.messages.emailConfirm;
        }
      }
    } catch (e: any) {
      error = e;
    }
    return { isConfirmed, message, error };
  }

  async resetPassword(email: string): Promise<AuthAction> {
    let error = null;
    let message = null;
    // sends reset password email
    try {
      await sendPasswordResetEmail(this.auth, email);
      message = this.messages.resetPassword;
    } catch (e: any) {
      error = e;
    }
    return { message, error };
  }

  async oAuthLogin(p: string): Promise<AuthAction> {
    let error = null;
    let message = null;
    let isNew = null;
    try {
      // get provider, sign in
      const provider = new OAuthProvider(p);
      const credential = await signInWithPopup(this.auth, provider);
      const additionalInfo = getAdditionalUserInfo(credential);
      if (additionalInfo) {
        isNew = additionalInfo.isNewUser;
      }

      // create user in db
      const userData = {
        displayName: credential.user.displayName,
        email: credential.user.email,
        phoneNumber: credential.user.phoneNumber,
        photoURL: credential.user.photoURL,
        role: Role.Author
      };
      await this.db.createUser(userData, credential.user.uid);
      message = this.messages.loginSuccess;

    } catch (e: any) {
      error = e;
    }
    return { isNew, message, error };
  }

  async oAuthReLogin(p: string): Promise<any> {
    let error = null;
    let message = null;
    try {
      const provider = new OAuthProvider(p);
      const _user = await this._fbUser();
      if (_user) {
        await reauthenticateWithPopup(_user, provider);
        message = this.messages.loginSuccess;
      }
    } catch (e: any) {
      error = e;
    }
    return { error, message };
  }

  logout(): void {
    signOut(this.auth);
  }

  //
  // Providers
  //

  async getProviders(): Promise<any[]> {
    const user = await this._fbUser();
    return user?.providerData
      .map((p: any) => p.providerId) || [];
  }

  async addProvider(p: string): Promise<AuthAction> {

    let message = null;
    let error = null;
    try {
      // get provider object from id
      const provider = new OAuthProvider(p);
      const _user = await this._fbUser();

      if (_user) {
        const credential = await linkWithPopup(_user, provider);

        // get new provider info
        const newProvider = credential.user!.providerData[0];

        // update photoURL and phoneNumber if null
        const photoURL = credential.user!.photoURL || newProvider!.photoURL;
        const phoneNumber = credential.user!.phoneNumber || newProvider!.phoneNumber;

        // update db
        await this.db.updateUser({ phoneNumber, photoURL }, credential.user.uid);
      }
    } catch (e: any) {
      error = e;
    }
    return { message, error };

  }

  async removeProvider(p: string): Promise<AuthAction> {

    let error = null;
    let message = null;
    try {
      // can't remove if only provider
      const providers = await this.getProviders();
      if (providers.length < 2) {
        throw this.errors.removeProvider;
      }
      const user = await this._fbUser();
      // remove provider from firebase auth
      if (user) {
        await unlink(user, p);
        message = this.replaceMsg(this.messages.providerRemoved, p);
      }
    } catch (e: any) {
      error = e;
    }
    return { message, error };
  }

  //
  // Profile
  //

  async updateUsername(username: string, currentUsername?: string): Promise<AuthAction> {
    // update in firebase authentication
    const user = await this._fbUser();
    let error = null;
    let message = null;

    if (user) {
      const { error: e } = await this.db.updateUsername(username, user.uid, currentUsername);
      error = e;
      message = this.messages.usernameUpdated;
    }
    return { message, error };
  }

  async updateEmail(email: string): Promise<AuthAction> {

    // update in firebase authentication
    const user = await this._fbUser();
    let error = null;
    let message = null;
    let reAuth = false;
    if (user) {
      try {
        await updateEmail(user, email);
        await this.db.updateUser({ email }, user.uid);
        await sendEmailVerification(user);
        message = this.messages.emailUpdated;
      } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
          reAuth = true;
        } else {
          error = e;
        }
      }
    }
    return { reAuth, error, message };
  }

  async sendVerificationEmail(): Promise<AuthAction> {

    let error = null;
    let message = null;
    try {
      // update in firebase authentication
      const user = await this._fbUser();

      if (user) {
        await sendEmailVerification(user);
        message = this.messages.emailVerifySent;
        this.logout();
      }
    } catch (e: any) {
      error = e;
    }
    return { error, message };
  }

  async updatePass(pass: string): Promise<AuthAction> {
    // update in firebase authentication
    const user = await this._fbUser();
    let error = null;
    let message = null;
    let reAuth = false;
    if (user) {
      try {
        await updatePassword(user, pass);
        message = this.messages.passUpdated;
      } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
          reAuth = true;
        } else {
          error = e;
        }
      }
    }
    return { reAuth, error, message };
  }

  async updateProfile(profile: {
    displayName?: string | null | undefined;
    photoURL?: string | null | undefined;
  }): Promise<AuthAction> {

    let error = null;
    let message = null;
    try {
      // update in firebase authentication
      const user = await this._fbUser();
      if (user) {
        await updateProfile(user, profile);
        await this.db.updateUser(profile, user.uid);
        message = this.messages.profileUpdated;
      };
    } catch (e: any) {
      error = e;
    }
    return { message, error };
  }

  async deleteUser(): Promise<AuthAction> {
    // delete user from firebase authentication
    const user = await this._fbUser();
    let error = null;
    let message = null;
    let reAuth = false;
    if (user) {
      try {
        await user.delete();
        await this.db.deleteUser(user.uid);
        message = this.messages.accountRemoved;
      } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
          reAuth = true;
        } else {
          error = e;
        }
      }
    }
    return { reAuth, error, message };
  }

  //
  // Tools
  //

  /**
   * Replaces variables and shows a message
   * @param msg message with {0} in it
   * @param v variable to replace
   */
  private replaceMsg(msg: string, v: string): string {
    const sFormat = (str: string, ...args: string[]) => str.replace(/{(\d+)}/g, (undefined, index) => args[index] || '');
    return sFormat(msg, v);
  }
}
