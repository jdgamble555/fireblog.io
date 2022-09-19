import { Injectable } from '@angular/core';
import { Auth, signOut, user } from '@angular/fire/auth';
import {
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc
} from '@angular/fire/firestore';
import { UserRec, UserRequest } from '@auth/user.model';
import { DbModule } from '@db/db.module';
import { setWithCounter } from '@db/fb-tools';
import { snapToData } from 'rxfire/firestore';
import { firstValueFrom, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: DbModule
})
export class UserDbService {

  user$: Observable<UserRec | null>;

  constructor(
    private afs: Firestore,
    private auth: Auth
  ) {

    // get user doc if logged in
    this.user$ = this._userSub();
  }

  private _userSub(): Observable<UserRec | null> {
    return user(this.auth).pipe(
      switchMap(user =>
        user
          ? this._subUserRec(user.uid, user.emailVerified)
          : of(null)
      )
    );
  }

  private _subUserRec(id: string, verified: boolean): Observable<UserRec> {
    return docData<UserRec>(
      doc(this.afs, 'users', id) as DocumentReference<UserRec>,
      { idField: 'uid' }
    ).pipe(
      map(d => ({ ...d, emailVerified: verified }))
    );
  }

  async getUser(): Promise<UserRequest<UserRec | null>> {
    // get user record
    let data = null;
    let error = null;
    try {
      const _user = (await firstValueFrom(user(this.auth)));
      if (_user?.uid) {
        data = await getDoc<UserRec>(
          doc(this.afs, 'users', _user?.uid) as DocumentReference<UserRec>
        ).then(snap => snapToData(snap, { idField: 'id' }))
          .then(data => ({ ...data, emailVerified: _user.emailVerified }));
      }
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  async createUser(user: UserRec, id: string): Promise<UserRequest<void>> {
    // create user only if DNE
    let error = null;
    try {
      const docSnap = await getDoc<UserRec>(
        doc(this.afs, 'users', id) as DocumentReference<UserRec>
      );
      if (!docSnap.exists()) {
        await setWithCounter(
          doc(this.afs, 'users', id),
          user
        );
      }
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  /**
   * Return total number of docs by a user
   * @param uid - user id
   * @param col - column
   * @returns
   */
  subUserTotal(uid: string, col: string): Observable<string> {
    return docData<any>(
      doc(this.afs, 'users', uid)
    ).pipe(
      map(r => r ? r[col + 'Count'] : null)
    );
  }

  async getUsernameFromId(uid: string): Promise<{ error?: any, data: string | null }> {
    let error = null;
    let data = null;
    try {
      // todo - fix typing here, add fb map
      data = await getDoc<any>(
        doc(this.afs, 'users', uid)
      ).then(snap => (snap.data())?.username) || null;
    }
    catch (e: any) {
      error = e;
    }
    return { data, error };
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
