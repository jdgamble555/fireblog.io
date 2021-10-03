import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  SetOptions,
  writeBatch
} from '@angular/fire/firestore';
import { FirebaseModule } from './firebase.module';

@Injectable({
  providedIn: 'root'
})
export class FirestoreToolsService {

  doc: Document;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private afs: Firestore,
    private fm: FirebaseModule
  ) {
    this.doc = this.document;
  }

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
    /*if ((countSnap.data() as any).count == 1) {
      batch.delete(countRef);
    }*/
    batch.commit();
  }

  async searchIndex(opts: {
    ref: DocumentReference<DocumentData>,
    after: any,
    fields: string[],
    del?: boolean,
    useSoundex?: boolean
  }) {

    opts.del = opts.del || false;
    opts.useSoundex = opts.useSoundex || true;

    const allCol = '_all';
    const searchCol = '_search';
    const termField = '_term';
    const numWords = 6;

    const colId = opts.ref.path.split('/').slice(0, -1).join('/');

    // get collection
    const searchRef = doc(
      this.afs,
      `${searchCol}/${colId}/${allCol}/${opts.ref.id}`
    );

    if (opts.del) {
      await deleteDoc(searchRef);
    } else {

      let data: any = {};
      let m: any = {};

      // go through each field to index
      for (const field of opts.fields) {

        // new indexes
        let fieldValue = opts.after[field];

        // if array, turn into string
        if (Array.isArray(fieldValue)) {
          fieldValue = fieldValue.join(' ');
        }
        let index = this.createIndex(fieldValue, numWords);

        // if filter function, run function on each word
        if (opts.useSoundex) {
          const temp = [];
          for (const i of index) {
            temp.push(i.split(' ').map(
              (v: string) => this.fm.soundex(v)
            ).join(' '));
          }
          index = temp;
        }

        for (const phrase of index) {
          if (phrase) {
            let v = '';
            for (let i = 0; i < phrase.length; i++) {
              v = phrase.slice(0, i + 1);
              // increment for relevance
              m[v] = m[v] ? m[v] + 1 : 1;
            }
          }
        }
      }
      data[termField] = m;
      data = { ...data, ...opts.after };

      try {
        await setDoc(searchRef, data)
      } catch (e: any) {
        console.error(e);
      }
    }
  }

  createIndex(html: string, n: number): string[] {
    // create document after text stripped from html
    function createDocs(text: string) {
      const finalArray: string[] = [];
      const wordArray = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/ +/g, ' ')
        .trim()
        .split(' ');
      do {
        finalArray.push(
          wordArray.slice(0, n).join(' ')
        );
        wordArray.shift();
      } while (wordArray.length !== 0);
      return finalArray;
    }
    // strip text from html
    const extractContent = (html: string) => {
      const tmp = this.doc.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    }
    // get rid of code first
    return createDocs(
      extractContent(html)
    );
  }
}
