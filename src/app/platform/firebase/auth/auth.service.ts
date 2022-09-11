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
  User,
  user,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from '@angular/fire/auth';
import { AuthAction, Role, UserAuth } from '@auth/user.model';
import { DbModule } from '@db/db.module';
import { UserDbService } from '@db/user/user-db.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { auth_messages } from './auth.messages';

@Injectable({
  providedIn: DbModule
})
export class AuthService {

  messages = auth_messages;
  user$: Observable<UserAuth | null>;

  constructor(
    private auth: Auth,
    private us: UserDbService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.user$ = this._user();
  }

  // User

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

  async getUser(): Promise<UserAuth | null> {
    return await firstValueFrom(this.user$);
  }

  // Login

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
      await this.us.createUser(userData, credential.user.uid);
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
        await this.us.createUser(userData, credential.user.uid);
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

  async sendVerificationEmail(): Promise<AuthAction> {

    let error = null;
    let message = null;
    try {
      // update in firebase authentication
      const _user = await firstValueFrom(user(this.auth));

      if (_user) {
        await sendEmailVerification(_user);
        message = this.messages.emailVerifySent;
        this.logout();
      }
    } catch (e: any) {
      error = e;
    }
    return { error, message };
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
      await this.us.createUser(userData, credential.user.uid);
      message = this.messages.loginSuccess;

    } catch (e: any) {
      error = e;
    }
    return { isNew, message, error };
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  // Providers

  async getProviders(): Promise<string[]> {
    const _user = await firstValueFrom(user(this.auth));
    return _user?.providerData
      .map((p: any) => p.providerId) || [];
  }
}
