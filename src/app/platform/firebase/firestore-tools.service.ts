import { Injectable } from '@angular/core';
import { arrayRemove, arrayUnion, collection, doc, DocumentData, DocumentReference, Firestore, getDoc, getDocs, increment, serverTimestamp, setDoc, SetOptions, writeBatch } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreToolsService {

  constructor(private afs: Firestore) { }

  /**
  * Generates an id for a new firestore doc
  * @returns
  */
  getId() {
    return doc(
      collection(this.afs, 'id')
    ).id;
  }

  async updateTags(
    docRef: DocumentReference,
    before: string[] = [],
    after: string[] = [],
    tagsDoc = 'tags'
  ) {

    const removed = before.length > 0
      ? before.filter((x: string) => !after.includes(x))
      : [];
    const added = after.length > 0
      ? after.filter((x: string) => !before.includes(x))
      : [];

    const batch = writeBatch(this.afs);

    // added
    for (const t of added) {

      // + 1 count
      const tagsRef = doc(this.afs, tagsDoc + '/' + t);
      const tagsSnap = await getDoc(tagsRef);

      if (tagsSnap.exists()) {
        batch.update(tagsRef, {
          count: increment(1)
        });
      } else {
        batch.set(tagsRef, {
          count: 1
        });
      }

      // add tag
      batch.update(docRef, {
        tags: arrayUnion(t)
      });
    }

    // removed
    for (const t of removed) {

      // -1 count
      const tagsRef = doc(this.afs, tagsDoc + '/' + t);
      const tagsSnap = await getDoc(tagsRef);

      if ((tagsSnap.data() as any).count == 1) {
        batch.delete(tagsRef);
      } else {
        batch.update(tagsRef, {
          count: increment(-1)
        });
      }

      // remove tag
      batch.update(docRef, {
        tags: arrayRemove(t)
      });
    }
    batch.commit();
  }


  async setWithCounter(
    ref: DocumentReference<DocumentData>,
    data: {
      [x: string]: any;
    },
    options?: SetOptions,
    uid = ''
  ): Promise<void> {

    options = options ? options : {};

    // counter collection
    const counterCol = '_counters';

    const col = ref.path.split('/').slice(0, -1).join('/');
    const countRef = doc(this.afs, counterCol, col);
    const countSnap = await getDoc(countRef);
    const refSnap = await getDoc(ref);

    // don't increase count if edit
    if (refSnap.exists()) {
      data.updatedAt = serverTimestamp();
      await setDoc(ref, data, options);

      // increase count
    } else {
      const batch = writeBatch(this.afs);
      data.createdAt = serverTimestamp();
      batch.set(ref, data, options);

      // if userCount
      if (uid) {
        batch.update(
          doc(this.afs, `users/${uid}`),
          {
            [col + 'Count']: increment(1)
          }
        );
      }

      // if count exists
      if (countSnap.exists()) {
        batch.update(countRef, {
          count: increment(1),
          docId: ref.id
        });
        // create count
      } else {
        // will only run once, should not use
        // for mature apps
        const colRef = collection(this.afs, col);
        const colSnap = await getDocs(colRef);
        batch.set(countRef, {
          count: colSnap.size + 1,
          docId: ref.id
        });
      }
      batch.commit();
    }
  }

  async deleteWithCounter(
    ref: DocumentReference<DocumentData>,
    uid = ''
  ): Promise<void> {

    // counter collection
    const counterCol = '_counters';

    const col = ref.path.split('/').slice(0, -1).join('/');
    const countRef = doc(this.afs, counterCol, col);
    const countSnap = await getDoc(countRef);
    const batch = writeBatch(this.afs);

    // if userCount
    if (uid) {
      batch.update(
        doc(this.afs, `users/${uid}`),
        {
          [col + 'Count']: increment(-1)
        }
      );
    }

    // if count exists
    batch.delete(ref);
    if (countSnap.exists()) {
      batch.update(countRef, {
        count: increment(-1),
        docId: ref.id
      });
    }
    if ((countSnap.data() as any).count == 1) {
      batch.delete(countRef);
    }
    batch.commit();
  }

}
