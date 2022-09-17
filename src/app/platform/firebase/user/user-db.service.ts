import { Injectable } from '@angular/core';
import { Auth, User, user } from '@angular/fire/auth';
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
import { firstValueFrom, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: DbModule
})
export class UserDbService {

  userRec: Observable<UserRec | null>;

  constructor(
    private afs: Firestore,
    private auth: Auth
  ) {

    // get user doc if logged in
    this.userRec = this._userSub();
  }

  private _userSub(): Observable<UserRec | null> {
    return user(this.auth).pipe(
      switchMap(user =>
        user
          ? this._subUserRec(user.uid)
          : of(null)
      )
    );
  }

  private _subUserRec(id: string): Observable<UserRec> {
    return docData<UserRec>(
      doc(this.afs, 'users', id) as DocumentReference<UserRec>,
      { idField: 'uid' }
    );
  }

  async getUserRec(): Promise<UserRequest<UserRec | null>> {
    // get user record
    let data = null;
    let error = null;
    try {
      const uid = (await firstValueFrom(user(this.auth)))?.uid;
      if (uid) {
        const docSnap = await getDoc<UserRec>(
          doc(this.afs, 'users', uid) as DocumentReference<UserRec>
        );
        if (docSnap.exists()) {
          data = docSnap.data();
        }
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
    let data= null;
    try {
      data = await getDoc<UserRec>(
        doc(this.afs, 'users', uid)
      ).then(snap => (snap.data())?.username) || null;
    }
    catch (e: any) {
      error = e;
    }
    return { data, error };
  }
}
