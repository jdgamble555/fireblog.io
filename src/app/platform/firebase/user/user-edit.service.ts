import { Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import {
  doc,
  Firestore,
  getDoc,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { UserRec, UserRequest } from '@auth/user.model';
import { AuthEditModule } from '@db/auth-edit.module';
import { deleteWithCounter } from '@db/fb-tools';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: AuthEditModule
})
export class UserEditService {

  constructor(
    private afs: Firestore,
    private auth: Auth,
  ) { }

  async getUid(): Promise<string | null> {
    return (await firstValueFrom(user(this.auth)))?.uid || null;
  }

  async updateUser({ photoURL, displayName, phoneNumber, email }: UserRec): Promise<UserRequest> {
    const uid = await this.getUid();
    let error = null;
    if (uid) {
      try {
        await setDoc(
          doc(this.afs, 'users', uid),
          { photoURL, displayName, phoneNumber, email },
          { merge: true }
        );
      } catch (e: any) {
        error = e;
      }
    }
    return { error };
  }

  async deleteUser(): Promise<UserRequest> {
    const uid = await this.getUid();
    let error = null;
    try {
      if (uid) {
        await deleteWithCounter(
          doc(this.afs, 'users', uid)
        );
      }
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async validUsername(name: string): Promise<UserRequest> {
    let exists: boolean | null = null;
    let error = null;
    // todo - fix any type
    try {
      exists = await getDoc<any>(
        doc(this.afs, 'usernames', name)
      ).then(doc => doc.exists());
    } catch (e: any) {
      error = e;
    }
    return { exists, error };
  }

  async updateUsername(username: string, currentUsername?: string): Promise<UserRequest> {
    let error = null;
    const uid = await this.getUid();
    if (uid) {
      try {
        const batch = writeBatch(this.afs);
        if (currentUsername) {
          batch.delete(
            doc(this.afs, 'usernames', currentUsername)
          );
        }
        batch.update(
          doc(this.afs, 'users', uid),
          { username }
        ).set(
          doc(this.afs, 'usernames', username),
          { uid }
        );
        await batch.commit();
      } catch (e: any) {
        error = e;
      }
    }
    return { error };
  }

  async hasUsername(): Promise<UserRequest> {
    let error = null;
    let exists = null;
    const uid = await this.getUid();
    if (uid) {
      try {
        // todo - fix any type
        exists = await getDoc<any>(
          doc(this.afs, 'users', uid)
        ).then(doc => {
          if (doc.exists()) {
            const r = doc.data();
            return 'username' in r;
          }
          return null;
        })
      } catch (e: any) {
        e = error;
      }
    }
    return { error, exists };
  }
}
