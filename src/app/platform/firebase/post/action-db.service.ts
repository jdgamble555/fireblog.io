import { Injectable } from '@angular/core';
import { doc, DocumentSnapshot, Firestore, getDoc } from '@angular/fire/firestore';
import { DbModule } from '@db/db.module';
import { deleteWithCounter, setWithCounter } from '@db/fb-tools';

@Injectable({
  providedIn: DbModule
})
export class ActionDbService {

  constructor(private afs: Firestore) { }

  async getAction(id: string, uid: string, action: string): Promise<{ error: any, data: boolean | null }> {
    let error = null;
    let data = null;
    try {
      data = await getDoc(
        doc(this.afs, action, `${id}_${uid}`)
      ).then((doc: DocumentSnapshot<any>) => doc.exists());
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  async getActionExists(postId: string, userId: string, action: string): Promise<{ data: boolean | null, error: any }> {
    let error = null;
    let data = null;
    try {
      data = await getDoc(
        doc(this.afs, action, `${postId}_${userId}`)
      ).then((snap: DocumentSnapshot) => snap.exists());
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  async actionPost(postId: string, userId: string, action: string): Promise<{ error: any}> {
    let error = null;
    try {
      await setWithCounter(
        doc(this.afs, action, `${postId}_${userId}`),
        {
          postDoc: doc(this.afs, 'posts', postId),
          userDoc: doc(this.afs, 'users', userId)
        },
        { merge: true },
        { paths: { posts: postId, users: userId } }
      );
    } catch (e: any) {
      error = e;
    }
    return { error };
  }

  async unActionPost(postId: string, userId: string, action: string): Promise<{ error: any}> {
    let error = null;
    try {
      await deleteWithCounter(
        doc(this.afs, action, `${postId}_${userId}`),
        { paths: { posts: postId, users: userId } }
      );
    } catch (e: any) {
      error = e;
    }
    return { error };
  }
}
