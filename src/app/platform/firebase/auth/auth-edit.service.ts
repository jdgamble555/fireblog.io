import { Injectable } from '@angular/core';
import {
  Auth,
  linkWithPopup,
  OAuthProvider,
  reauthenticateWithPopup,
  sendEmailVerification,
  unlink,
  updateEmail,
  updatePassword,
  updateProfile,
  User,
  user
} from '@angular/fire/auth';
import { AuthAction } from '@auth/user.model';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { auth_messages, auth_errors, replaceMsg } from './auth.messages';
import { AuthEditModule } from '@db/auth-edit.module';
import { UserEditService } from '@db/user/user-edit.service';

@Injectable({
  providedIn: AuthEditModule
})
export class AuthEditService {

  messages = auth_messages;
  errors = auth_errors;

  constructor(
    private auth: Auth,
    private as: AuthService,
    private ues: UserEditService
  ) { }

  private async _fbUser(): Promise<User | null> {
    return await firstValueFrom(user(this.auth));
  }

  // Auth

  async oAuthReLogin(p: string): Promise<AuthAction> {
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

  // Providers

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
        await this.ues.updateUser({ phoneNumber, photoURL });
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
      const providers = await this.as.getProviders();
      if (providers.length < 2) {
        throw this.errors.removeProvider;
      }
      const user = await this._fbUser();
      // remove provider from firebase auth
      if (user) {
        await unlink(user, p);
        message = replaceMsg(this.messages.providerRemoved, p);
      }
    } catch (e: any) {
      error = e;
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
        // todo - fix error checking here
        await this.ues.updateUser({ email });
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
        await this.ues.updateUser(profile);
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
        await this.ues.deleteUser();
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
}
