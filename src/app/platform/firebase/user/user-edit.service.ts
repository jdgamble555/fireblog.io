import { Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import {
  doc,
  DocumentSnapshot,
  Firestore,
  getDoc,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { UserRec } from '@auth/user.model';
import { AuthEditModule } from '@db/auth-edit.module';
import { deleteWithCounter } from '@db/fb-tools';
import { firstValueFrom } from 'rxjs';
import { user_messages } from './user.messages';

@Injectable({
  providedIn: AuthEditModule
})
export class UserEditService {

  messages = user_messages;

  constructor(
    private afs: Firestore,
    private auth: Auth,
  ) { }

  async getUid() {
    return (await firstValueFrom(user(this.auth)))?.uid || null;
  }

  async updateUser(user: any): Promise<{ error: string | null }> {
    const uid = await this.getUid();
    let error = null;
    if (uid) {
      try {
        await setDoc(
          doc(this.afs, 'users', uid),
          user,
          { merge: true }
        );
      } catch (e: any) {
        error = e;
      }
    }
    return { error };
  }

  async deleteUser(): Promise<void> {
    // todo - add try catch
    const uid = await this.getUid();
    if (uid) {
      await deleteWithCounter(
        doc(this.afs, 'users', uid)
      );
    }
  }

  async validUsername(name: string): Promise<{ error: string | null, data: boolean | null }> {
    let data = null;
    let error = null;
    try {
      data = await getDoc(
        doc(this.afs, 'usernames', name)
      ).then((doc: DocumentSnapshot<any>) => doc.exists());
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  async updateUsername(username: string, currentUsername?: string): Promise<{ error: string | null, message: string | null }> {
    let error = null;
    let message = null;
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
        message = this.messages.usernameUpdated;
      } catch (e: any) {
        error = e;
      }
    }
    return { error, message };
  }

  async hasUsername(): Promise<{ error: string | null, data: boolean | null }> {
    let error = null;
    let data = null;
    const uid = await this.getUid();
    if (uid) {
      try {
        data = await getDoc<UserRec>(
          doc(this.afs, 'users', uid)
        ).then((doc) => {
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
    return { error, data };
  }
}
