import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AuthAction, UserAuth } from '@auth/user.model';
import { DbModule } from '@db/db.module';
import { UserDbService } from '@db/user/user-db.service';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { auth_messages } from './auth.messages';
import { Provider, User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: DbModule
})
export class AuthService {

  messages = auth_messages;
  user$: Observable<UserAuth | null>;

  constructor(
    private us: UserDbService,
    private sb: SupabaseService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.user$ = this._user();
  }

  // User

  private _mapUser(u: User): UserAuth {
    return ({
      uid: u.id,
      email: u.email,
      emailVerified: !!u.email_confirmed_at,
      photoURL: u?.user_metadata['avatar_url'],
      phoneNumber: u.phone,
      displayName: u?.user_metadata['full_name']
    } as UserAuth);
  }

  private _user(): Observable<UserAuth | null> {
    return this.sb.authState().pipe(
      map((u: User | null) => u ? this._mapUser(u) : null),
      tap(async (u: UserAuth | null) => {
        if (u) {
          // add user info if user DNE
          await this._userCheck(u);
        }
      })
    )
  }

  private async _userCheck(u: UserAuth): Promise<void> {

    // create user if DNE
    const { error, data: user } = await this.us.getUserRec();
    if (error) {
      console.error(error);
    }
    if (!user) {
      await this.us.createUser(u, u.uid);
    }
  }

  async getUser(): Promise<UserAuth | null> {
    return await firstValueFrom(this.user$);
  }

  // Login

  async emailLogin(email: string, password: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.signIn({ email, password });
    return { error };
  }

  async emailSignUp(email: string, password: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.signUp({ email, password });
    return { error };
  }

  async sendEmailLink(email: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.signIn({ email });
    return { error };
  }

  async sendVerificationEmail(): Promise<AuthAction> {
    // not available for supabase
    return { error: null };
  }

  async confirmSignIn(url: string, email?: string): Promise<AuthAction> {
    // not necessary for supabase
    return { isConfirmed: false, error: null };
  }

  async resetPassword(email: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.api.resetPasswordForEmail(email);
    return { error };
  }

  async oAuthLogin(p: string): Promise<AuthAction> {
    p = p.replace('.com', '');
    const { error } = await this.sb.supabase.auth.signIn({
      provider: p as Provider,
    });
    return { error };
  }

  async logout(): Promise<void> {
    const { error } = await this.sb.supabase.auth.signOut();
    if (error) {
      console.error(error);
    }
  }

  // Providers

  async getProviders(): Promise<string[]> {
    const sb = this.sb.supabase.auth.user();
    let providers: string[] = sb?.app_metadata.providers;
    providers = providers.map((p: string) => p === 'google' ? 'google.com' : p);
    return providers;
  }
}
