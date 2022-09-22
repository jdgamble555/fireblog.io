import { Injectable } from '@angular/core';
import { Auth, signOut, User, user } from '@angular/fire/auth';
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
          ? this._subUserRec(user)
          : of(null)
      )
    );
  }

  private _subUserRec(user: User | null): Observable<UserRec | null> {
    const uid = user?.uid as string;
    const emailVerified = user?.emailVerified;
    const providers = user?.providerData.map(p => p.providerId.replace('.com', ''));
    return docData<UserRec>(
      doc(this.afs, 'users', uid) as DocumentReference<UserRec>,
      { idField: 'uid' }
    ).pipe(
      map(d => ({ ...d, emailVerified, providers }))
    );
  }

  async getUser(): Promise<UserRequest> {
    // get user record
    let data = null;
    let error = null;
    try {
      const _user = (await firstValueFrom(user(this.auth)));
      const emailVerified = _user?.emailVerified;
      const providers = _user?.providerData.map(p => p.providerId.replace('.com', ''));
      if (_user?.uid) {
        data = await getDoc<UserRec>(
          doc(this.afs, 'users', _user?.uid) as DocumentReference<UserRec>
        ).then(snap => snapToData(snap, { idField: 'uid' }))
          .then(data => ({ ...data, emailVerified, providers }));
      }
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  async createUser(user: UserRec, id: string): Promise<UserRequest> {
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

  async getUsernameFromId(uid: string): Promise<UserRequest> {
    let error = null;
    let data = null;
    try {
      data = await getDoc<UserRec>(
        doc(this.afs, 'users', uid)
      ).then(snap => snapToData(snap));
    }
    catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
