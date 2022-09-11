import { Injectable } from '@angular/core';
import { UserRec } from '@auth/user.model';
import { DbModule } from '@db/db.module';
import { User } from '@supabase/supabase-js';
import { map, Observable, of, switchMap } from 'rxjs';
import { sb_User, SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: DbModule
})
export class UserDbService {

  userRec: Observable<UserRec | null>;

  constructor(
    private sb: SupabaseService
  ) {

    // get user rec if logged in
    this.userRec = this.userSub();
  }

  private mapUser(user: sb_User): UserRec {
    return ({
      uid: user?.id,
      photoURL: user?.photo_url,
      displayName: user?.display_name,
      createdAt: user?.created_at,
      updatedAt: user?.updated_at,
      username: user?.username
    });
  }

  userSub(): Observable<UserRec | null> {
    return this.sb.authState().pipe(
      switchMap((user: User | null) =>
        user
          ? this.sb.subWhere('profiles', 'id', user?.id)
          : of(null)
      ),
      map((user: sb_User) => user ? this.mapUser(user) : null)
    );
  }

  async getUserRec(): Promise<UserRec | null> {
    const id = this.sb.supabase.auth.user()?.id;
    const { data: user, error } = await this.sb.supabase.from('profiles').select('*').eq('id', id).single();
    if (error) {
      console.error(error);
    }
    return user ? this.mapUser(user) : null;
  }


  async createUser(user: UserRec, id: string): Promise<void> {
    const { data, error } = await this.sb.supabase.from('profiles').upsert({
      id: user.uid,
      photo_url: user.photoURL,
      //phoneNumber: u.phone,
      display_name: user.displayName
    });
    if (error) {
      console.log(error);
    }
    return;
  }

  /**
   * Return total number of docs by a user
   * @param uid - user id
   * @param col - column
   * @returns
   */

  async getUsernameFromId(uid: string): Promise<{ error?: any, username: string | null }> {
    let error = null;
    let username = null;
    return { username, error };
  }

}
