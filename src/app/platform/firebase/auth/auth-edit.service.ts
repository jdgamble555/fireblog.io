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
import { auth_messages, auth_errors } from './auth.messages';
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
    private ues: UserEditService
  ) { }

  private async _fbUser(): Promise<User | null> {
    return await firstValueFrom(user(this.auth));
  }

  // Auth

  async oAuthReLogin(p: string): Promise<AuthAction> {
    let error = null;
    try {
      const provider = new OAuthProvider(p);
      const _user = await this._fbUser();
      if (_user) {
        await reauthenticateWithPopup(_user, provider);
      }
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  // Providers

  async addProvider(p: string): Promise<AuthAction> {
    p = p === 'google' ? 'google.com' : p;
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
        const { error: _e } = await this.ues.updateUser({ phoneNumber, photoURL });
        if (_e) {
          throw _e;
        }
      }
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async removeProvider(p: string): Promise<AuthAction> {
    p = p === 'google' ? 'google.com' : p;
    // remove provider from user
    let error = null;
    try {
      const user = await this._fbUser();
      // remove provider from firebase auth
      if (user) {
        await unlink(user, p);
      }
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async updateEmail(email: string): Promise<AuthAction> {
    // update in firebase authentication
    const user = await this._fbUser();
    let error = null;
    let reAuth = false;
    if (user) {
      try {
        await updateEmail(user, email);
        const { error: _e } = await this.ues.updateUser({ email });
        if (_e) {
          throw _e;
        }
        await sendEmailVerification(user);
      } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
          reAuth = true;
        } else {
          error = e;
        }
      }
    }
    return { reAuth, error };
  }

  async updatePass(pass: string): Promise<AuthAction> {
    // update in firebase authentication
    const user = await this._fbUser();
    let error = null;
    let reAuth = false;
    if (user) {
      try {
        await updatePassword(user, pass);
      } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
          reAuth = true;
        } else {
          error = e;
        }
      }
    }
    return { reAuth, error };
  }

  async updateProfile(profile: {
    displayName?: string | null | undefined;
    photoURL?: string | null | undefined;
  }): Promise<AuthAction> {
    // update profile
    let error = null;
    try {
      // update in firebase authentication
      const user = await this._fbUser();
      if (user) {
        await updateProfile(user, profile);
        const {error: _e } = await this.ues.updateUser(profile);
        if (_e) {
          throw _e;
        }
      };
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async deleteUser(): Promise<AuthAction> {
    // delete user from firebase authentication
    const user = await this._fbUser();
    let error = null;
    let reAuth = false;
    if (user) {
      try {
        await user.delete();
        const { error: _e } = await this.ues.deleteUser();
        if (_e) {
          throw _e;
        }
      } catch (e: any) {
        if (e.code === 'auth/requires-recent-login') {
          reAuth = true;
        } else {
          error = e;
        }
      }
    }
    return { reAuth, error };
  }
}
