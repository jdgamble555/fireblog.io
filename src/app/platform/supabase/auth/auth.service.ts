import { Injectable } from '@angular/core';
import { AuthAction, UserRec } from '@auth/user.model';
import { DbModule } from '@db/db.module';
import { UserDbService } from '@db/user/user-db.service';
import { map, Observable, tap } from 'rxjs';
import { Provider, User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: DbModule
})
export class AuthService {

  user$: Observable<UserRec | null>;

  constructor(
    private us: UserDbService,
    private sb: SupabaseService
  ) {
    this.user$ = this._user();
  }

  // User

  private _mapUser(u: User): UserRec {
    return ({
      uid: u.id,
      email: u.email,
      emailVerified: !!u.email_confirmed_at,
      photoURL: u?.user_metadata['avatar_url'],
      phoneNumber: u.phone,
      displayName: u?.user_metadata['full_name']
    } as UserRec);
  }

  private _user(): Observable<UserRec | null> {
    return this.sb.authState().pipe(
      map(u => u ? this._mapUser(u) : null),
      tap(async (u: UserRec | null) => {
        if (u) {
          // add user info if user DNE
          await this._userCheck(u);
        }
      })
    )
  }

  private async _userCheck(u: UserRec): Promise<void> {

    // create user if DNE
    const { error, data: user } = await this.us.getUser();
    if (error) {
      console.error(error);
    }
    if (!user && u.uid) {
      await this.us.createUser(u, u.uid);
    }
  }

  async getUser(): Promise<UserRec | null> {
    const user = (await this.sb.supabase.auth.getSession()).data.session?.user;
    const _data = user ? this._mapUser(user) : null;
    return _data;
  }

  // Login

  async emailLogin(email: string, password: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async emailSignUp(email: string, password: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.signUp({ email, password });
    return { error };
  }

  async sendEmailLink(email: string): Promise<AuthAction> {
    const { error } = await this.sb.supabase.auth.signInWithOtp({ email });
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
    const { error } = await this.sb.supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  async oAuthLogin(p: string): Promise<AuthAction> {
    p = p.replace('.com', '');
    const { error } = await this.sb.supabase.auth.signInWithOAuth({
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
}
