import { Injectable } from '@angular/core';
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
    private as: AuthService,
    private ues: UserEditService
  ) { }

  // Auth

  async oAuthReLogin(p: string): Promise<AuthAction> {
    let error = null;
    return { error };
  }

  // Providers

  async addProvider(p: string): Promise<AuthAction> {
    let error = null;
    return { error };
  }

  async removeProvider(p: string): Promise<AuthAction> {
    let error = null;
    return { error };
  }

  async updateEmail(email: string): Promise<AuthAction> {
    let error = null;
    let reAuth = false;
    return { reAuth, error };
  }

  async updatePass(pass: string): Promise<AuthAction> {
    let error = null;
    let reAuth = false;
    return { reAuth, error };
  }

  async updateProfile(profile: {
    displayName?: string | null | undefined;
    photoURL?: string | null | undefined;
  }): Promise<AuthAction> {
    let error = null;
    return { error };
  }

  async deleteUser(): Promise<AuthAction> {
    let error = null;
    let reAuth = false;
    return { reAuth, error };
  }
}
