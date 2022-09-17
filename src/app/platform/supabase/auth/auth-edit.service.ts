import { Injectable } from '@angular/core';
import { AuthAction } from '@auth/user.model';
import { auth_messages, auth_errors } from './auth.messages';
import { AuthEditModule } from '@db/auth-edit.module';
import { SupabaseService } from '../supabase.service';
import { UserEditService } from '@db/user/user-edit.service';

@Injectable({
  providedIn: AuthEditModule
})
export class AuthEditService {

  messages = auth_messages;
  errors = auth_errors;

  constructor(
    private sb: SupabaseService,
    private ues: UserEditService
  ) { }

  // Auth

  async oAuthReLogin(p: string): Promise<AuthAction> {
    // not necessary for supabase
    return { error: null };
  }

  // Providers

  async addProvider(p: string): Promise<AuthAction> {
    // would need to write stored procedure for this
    return { error: null };
  }

  async removeProvider(p: string): Promise<AuthAction> {
    // would need to write stored procedure for this
    return { error: null };
  }

  async updateEmail(email: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.update({ email });
    return { reAuth: false, error };
  }

  async updatePass(password: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.update({ password });
    return { reAuth: false, error };
  }

  async updateProfile({ displayName, photoURL }: {
    displayName?: string | null | undefined;
    photoURL?: string | null | undefined;
  }): Promise<AuthAction> {
    let data = {};
    if (displayName) {
      data = { full_name: displayName, name: displayName };
    }
    if (photoURL) {
      data = { ...data, avatar_url: photoURL, picture: photoURL };
    }
    let { error } = await this.sb.supabase.auth.update({ data });
    ({ error } = await this.ues.updateUser({ displayName, photoURL }));
    return { error };
  }

  async deleteUser(): Promise<AuthAction> {
    // would need to write stored procedure for this
    return { reAuth: false, error: null };
  }
}
