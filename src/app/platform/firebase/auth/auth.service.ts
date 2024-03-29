import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  getAdditionalUserInfo,
  OAuthProvider,
  user,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from '@angular/fire/auth';
import { AuthAction, Role } from '@auth/user.model';
import { AuthDbModule } from '@db/auth-db.module';
import { UserDbService } from '@db/user/user-db.service';
import { firstValueFrom } from 'rxjs';
import { auth_messages } from './auth.messages';

@Injectable({
  providedIn: AuthDbModule
})
export class AuthService {

  messages = auth_messages;

  constructor(
    private auth: Auth,
    private us: UserDbService,
    @Inject(DOCUMENT) private doc: Document
  ) { }

  // Login

  async emailLogin(email: string, password: string): Promise<AuthAction> {

    let error = null;
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const userData = {
        email,
        role: Role.Author
      };
      // create user in db
      const { error } = await this.us.createUser(userData, credential.user.uid);
      if (error) {
        throw error;
      }
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async emailSignUp(email: string, password: string): Promise<AuthAction> {
    let error = null;
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
        const { error: _e } = await this.us.createUser(userData, credential.user.uid);
        if (_e) {
          throw _e;
        }
      }
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async sendEmailLink(email: string): Promise<AuthAction> {
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
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async sendVerificationEmail(): Promise<AuthAction> {
    let error = null;
    try {
      // update in firebase authentication
      const _user = await firstValueFrom(user(this.auth));

      if (_user) {
        await sendEmailVerification(_user);
        await this.us.logout();
      }
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async confirmSignIn(url: string, email?: string): Promise<AuthAction> {
    let error = null;
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
        }
      }
    } catch (e: any) {
      error = e;
    }
    return { isConfirmed, error };
  }

  async resetPassword(email: string): Promise<AuthAction> {
    let error = null;
    // sends reset password email
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async oAuthLogin(p: string): Promise<AuthAction> {
    let error = null;
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
      const { error: _e } = await this.us.createUser(userData, credential.user.uid);
      if (_e) {
        throw _e;
      }
    } catch (e: any) {
      error = e;
    }
    return { isNew, error };
  }
}
