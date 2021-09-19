import { Injectable } from '@angular/core';

import {
  doc,
  deleteDoc,
  Firestore,
  setDoc,
  deleteField,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  collection,
  getDoc,
  docData,
  docSnapshots,
  DocumentSnapshot,
  DocumentReference,
  DocumentData,
  SetOptions,
  writeBatch,
  increment,
  getDocs
} from '@angular/fire/firestore';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/auth/user.model';
import { Post } from 'src/app/post/post.model';

//
// Update Database Functions
//
@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private afs: Firestore) { }

  //
  // User
  //

  async createUser(user: User, id: string): Promise<void> {
    await setDoc(
      doc(this.afs, 'users', id),
      user
    );
  }

  async updateUser(user: any, id: string): Promise<void> {
    await setDoc(
      doc(this.afs, 'users', id),
      user,
      { merge: true }
    );
  }

  async deleteUser(id: string): Promise<void> {
    await deleteDoc(
      doc(this.afs, 'users', id)
    );
  }

  //
  // Posts
  //

  /**
   * Generates an id for a new firestore doc
   * @returns
   */
  getId() {
    return doc(
      collection(this.afs, 'id')
    ).id;
  }
  /**
   * Get latest version of post
   * @param id
   * @returns
   */
  getPostData(id: string) {

    // get doc refs
    const docRef = doc(this.afs, 'posts', id);
    const draftRef = doc(this.afs, 'drafts', id);

    // return latest, draft or published
    return docSnapshots<Post>(draftRef).pipe(
      switchMap((doc: DocumentSnapshot<Post>) =>
        doc.exists()
          ? docData(draftRef, { idField: 'id' })
          : docData(docRef, { idField: 'id' })
      )
    );
  }
  /**
   * Edit an existing post / create new post
   * @param id doc id
   * @param data doc data
   * @returns void
   */
  async setPost(data: Post, id = this.getId(), publish = false): Promise<string> {

    // id and published
    data.postID = id;
    data.published = publish;

    // create author doc ref
    if (data.authorId) {

      data.authorDoc = doc(this.afs, 'users', data.authorId);

      // get doc refs
      const docRef = doc(this.afs, 'posts', id);
      const draftRef = doc(this.afs, 'drafts', id);
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data() as Post;

      // remove tags from update
      let { tags, ...tmp } = data;
      data = tmp;

      if (!publish) {
        // save tags normally for drafts
        data.tags = tags.reduce((obj: any, t: string) => {
          obj[t] = true;
          return obj;
        }, {});
      }

      // get timestamp
      if (docSnap.exists()) {
        data.updatedAt = serverTimestamp();
        data.createdAt = docData.createdAt;
      } else {
        if (publish) {
          data.createdAt = serverTimestamp();
        }
      }

      // save changes
      await this.setWithCounter(
        publish ? docRef : draftRef,
        data,
        { merge: true }
      );

      if (publish) {

        // delete draft doc
        await this.deleteWithCounter(draftRef);

        // update tags
        this.updateTags(id, Object.keys(docData.tags), tags);

      }
    }
    return id;
  }
  /**
   * Delete Post by ID
   * @param id
   */
  async deletePost(id: string): Promise<void> {
    await this.deleteWithCounter(
      doc(this.afs, 'posts', id)
    );
  }
  /**
   * Delete's an image from post doc
   * @param id doc id
   * @returns
   */
  async deleteImage(id: string): Promise<void> {
    await this.setPost({ image: deleteField() }, id);
  }

  async addPostImage(id: string, val: string): Promise<void> {
    await this.setPost({ imageUploads: arrayUnion(val) }, id);
  }

  async deletePostImage(id: string, val: string): Promise<void> {
    await this.setPost({ imageUploads: arrayRemove(val) }, id);
  }

  async updateTags(id: string, before: string[], after: string[]) {

    const removed = before.filter((x: string) => !after.includes(x));
    const added = after.filter((x: string) => !before.includes(x));

    const batch = writeBatch(this.afs);

    const postRef = doc(this.afs, 'posts/' + id);

    // added
    for (const t of added) {

      // + 1 count
      const tagsRef = doc(this.afs, 'tags/' + t);
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
      batch.update(postRef, {
        [`tags.${t}`]: true
      });
    }

    // removed
    for (const t of removed) {

      // -1 count
      const tagsRef = doc(this.afs, 'tags/' + t);
      const tagsSnap = await getDoc(tagsRef);

      if ((tagsSnap.data() as any).count == 1) {
        batch.delete(tagsRef);
      } else {
        batch.update(tagsRef, {
          count: increment(-1)
        });
      }

      // remove tag
      batch.update(postRef, {
        [`tags.${t}`]: deleteField()
      });
    }
    batch.commit();
  }

  //
  // Tools
  //

  async setWithCounter(
    ref: DocumentReference<DocumentData>,
    data: {
      [x: string]: any;
    },
    options: SetOptions): Promise<void> {

    // counter collection
    const counterCol = '_counters';

    const col = ref.path.split('/').slice(0, -1).join('/');
    const countRef = doc(this.afs, counterCol, col);
    const countSnap = await getDoc(countRef);
    const refSnap = await getDoc(ref);

    // don't increase count if edit
    if (refSnap.exists()) {
      await setDoc(ref, data, options);

      // increase count
    } else {
      const batch = writeBatch(this.afs);
      batch.set(ref, data, options);

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
    ref: DocumentReference<DocumentData>
  ): Promise<void> {

    // counter collection
    const counterCol = '_counters';

    const col = ref.path.split('/').slice(0, -1).join('/');
    const countRef = doc(this.afs, counterCol, col);
    const countSnap = await getDoc(countRef);
    const batch = writeBatch(this.afs);

    // if count exists
    batch.delete(ref);
    if (countSnap.exists()) {
      batch.update(countRef, {
        count: increment(-1),
        docId: ref.id
      });
    }
    /*
    if ((countSnap.data() as any).count == 1) {
      batch.delete(countRef);
    }*/
    batch.commit();
  }

}
