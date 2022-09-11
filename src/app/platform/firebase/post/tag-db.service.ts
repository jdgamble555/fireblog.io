import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDocs,
  query
} from '@angular/fire/firestore';
import { DbModule } from '@db/db.module';
import { Tag } from '@post/post.model';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: DbModule
})
export class TagDbService {

  constructor(private afs: Firestore) { }

  async getTags(): Promise<{ data: Tag[] | null, error: string | null }> {
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

  /**
   * Get all tags and their count
   * @returns tags
   */
  private subTags(): Observable<Tag[]> {
    return collectionData<Tag>(
      query<Tag>(
        collection(this.afs, 'tags')
      ), { idField: 'name' }
    );
  }

  /**
   * Get tag count from tag doc
   * @param t - tag
   * @returns
   */
  subTagTotal(t: string): Observable<string> {
    return docData<any>(
      doc(this.afs, 'tags', t)
    ).pipe(
      map((r: any) => r ? r.count : null)
    );
  }
}
