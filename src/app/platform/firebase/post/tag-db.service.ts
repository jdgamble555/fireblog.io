import { Injectable } from '@angular/core';
import {
  collection,
  Firestore,
  getDocs,
  query
} from '@angular/fire/firestore';
import { DbModule } from '@db/db.module';
import { Tag } from '@post/post.model';

@Injectable({
  providedIn: DbModule
})
export class TagDbService {

  constructor(private afs: Firestore) { }

  async getTags(): Promise<{ data: Tag[] | null, error: any }> {
    let error, data = null;
    try {
      data = await getDocs<Tag>(
        query<Tag>(
          collection(this.afs, 'tags')
        )
      ).then((snap) => {
        const docs = [];
        for (const doc of snap.docs) {
          docs.push({
            name: doc.id,
            ...doc.data()
          });
        }
        return docs;
      });
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }
}
