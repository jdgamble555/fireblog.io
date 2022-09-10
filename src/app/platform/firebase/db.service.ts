import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import {
  doc,
  Firestore,
  setDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  docData,
  docSnapshots,
  DocumentSnapshot,
  updateDoc,
  collection,
  DocumentReference,
  writeBatch,
  increment
} from '@angular/fire/firestore';
import { UserRec } from '@auth/user.model';
import { Post } from '@post/post.model';
import { MarkdownService } from 'ngx-markdown';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { firstValueFrom, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DbModule } from './db.module';


import {
  deleteWithCounter,
  searchIndex,
  setWithCounter
} from './fb-tools';

@Injectable({
  providedIn: DbModule
})
export class DbService {

  constructor(
    private afs: Firestore,
    private auth: Auth,
    private markdownService: MarkdownService,
    @Inject(DOCUMENT) private document: Document
  ) { }
  //
  // User
  //

  private subUsername(uid: string): Observable<string | null> {
    return docData<UserRec>(
      doc(this.afs, 'users', uid)
    ).pipe(
      map((r: any) => r ? r.username : null)
    );
  }

  async hasUsername(uid: string): Promise<{ error: string | null, data: boolean | null }> {
    let error = null;
    let data = null;
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
    return { error, data };
  }

  private subHasUsername(uid: string): Observable<boolean> {
    return docData<UserRec>(
      doc(this.afs, 'users', uid)
    ).pipe(
      map((r: any) => r && 'username' in r)
    );
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

  private subValidUsername(name: string): Observable<boolean> {
    return docSnapshots(
      doc(this.afs, 'usernames', name)
    ).pipe(
      map((snap: DocumentSnapshot<any>) => snap.exists())
    );
  }

  async updateUsername(username: string, currentUsername?: string): Promise<any> {
    const uid = (await firstValueFrom(user(this.auth)))?.uid;
    if (uid) {
      const batch = writeBatch(this.afs);
      if (currentUsername) {
        batch.delete(
          doc(this.afs, 'usernames', currentUsername)
        );
      }
      batch.update(
        doc(this.afs, 'users', uid),
        { username }
      );
      batch.set(
        doc(this.afs, 'usernames', username),
        { uid }
      );
      return batch.commit();
    }
  }

  async createUser(user: UserRec, id: string): Promise<void> {

    // create user only if DNE
    const docSnap = await getDoc<UserRec>(
      doc(this.afs, 'users', id) as DocumentReference<UserRec>
    );
    if (!docSnap.exists()) {
      await setWithCounter(
        doc(this.afs, 'users', id),
        user
      );
    }
    return;
  }

  async updateUser(user: any, id: string): Promise<void> {
    await setDoc(
      doc(this.afs, 'users', id),
      user,
      { merge: true }
    );
  }

  async deleteUser(id: string): Promise<void> {
    await deleteWithCounter(
      doc(this.afs, 'users', id)
    );
  }
  //
  // Posts
  //

  /**
    * Get latest version of post
    * @param id
    * @returns
    */
  private subPostData(id: string): Observable<Post> {

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

  async getPostData(id: string): Promise<{ error: string | null, data: Post | null }> {
    const docRef = doc(this.afs, 'posts', id);
    const draftRef = doc(this.afs, 'drafts', id);

    let error, data = null;
    try {
      data = await getDoc<Post>(draftRef)
        .then((snap: DocumentSnapshot<Post>) => snap.exists()
          ? getDoc(draftRef)
          : getDoc(docRef))
        .then((doc: DocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() }));
    } catch (e: any) {
      error = e;
    }
    return { error, data };
  }

  /**
   * Edit an existing post / create new post
   * @param id doc id
   * @param data doc data
   * @returns void
   */
  async setPost(data: Post, id = this.getId(), publish = false): Promise<string> {

    const authorId = data.authorId;

    // create author doc ref
    if (authorId) {

      data.authorDoc = doc(this.afs, 'users', authorId);

      // get doc refs
      const docRef = doc(this.afs, 'posts', id);
      const draftRef = doc(this.afs, 'drafts', id);
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data() as Post || [];

      // remove counters from update
      let {
        heartsCount,
        draftsCount,
        bookmarksCount,
        _tmpDoc,
        ...d
      } = data;
      data = d;

      if (publish) {

        // remove tags
        let { tags, ...tmp } = data;
        data = tmp;

        // save changes
        await setWithCounter(
          docRef,
          data,
          { merge: true },
          { paths: { users: authorId } }
        );

        // delete draft doc
        await deleteWithCounter(
          draftRef,
          { paths: { users: authorId } }
        );

        // update tags
        await this.updateTags(
          doc(this.afs, 'posts/' + id),
          docData.tags,
          tags
        );

        // index post, run in background, don't wait
        data.content = this.markdownService.parse(data.content as string);
        data.tags = tags;
        this.indexPost(id, data);

      } else {

        // save draft
        await setWithCounter(
          draftRef,
          data,
          { merge: true },
          { paths: { users: authorId } }
        );
      }
    }
    return id;
  }
  /**
   * Delete Post by ID
   * @param id
   */
  async deletePost(id: string, uid: string): Promise<void> {
    await deleteWithCounter(
      doc(this.afs, 'posts', id),
      { paths: { users: uid } }
    );
  }
  //
  // Images
  //

  /**
   * Add image to post doc
   * @param id
   * @param url
   */
  async addPostImage(id: string, url: string): Promise<void> {
    await updateDoc(
      doc(this.afs, 'drafts', id),
      { imageUploads: arrayUnion(url) }
    );
  }
  /**
   * Delete image from post doc
   * @param id
   * @param url
   */
  async deletePostImage(id: string, url: string): Promise<void> {
    await updateDoc(
      doc(this.afs, 'drafts', id),
      { imageUploads: arrayRemove(url) }
    );
  }

  /**
  * Generates an id for a new firestore doc
  * @returns
  */
  getId(): string {
    return doc(
      collection(this.afs, 'id')
    ).id;
  }

  //
  // Search Index
  //

  /**
   * Create Post Index
   * @param id
   * @param data
   */
  async indexPost(id: string, data: any): Promise<void> {
    await searchIndex(this.document, {
      ref: doc(this.afs, 'posts', id),
      after: data,
      fields: ['content', 'title', 'tags']
    });
  }
  /**
   * Update Tags Doc
   * @param docRef
   * @param before
   * @param after
   * @param tagsDoc
   */
  async updateTags(
    docRef: DocumentReference,
    before: string[] = [],
    after: string[] = [],
    tagsDoc = 'tags'
  ): Promise<void> {

    const removed = before.length > 0
      ? before.filter((x: string) => !after.includes(x))
      : [];
    const added = after.length > 0
      ? after.filter((x: string) => !before.includes(x))
      : [];

    const batch = writeBatch(docRef.firestore);

    batch.update(
      docRef,
      { tags: after }
    );

    // added
    for (const t of added) {

      // + 1 count
      batch.set(
        doc(docRef.firestore, tagsDoc + '/' + t),
        { count: increment(1), _tmpDoc: docRef },
        { merge: true }
      );
    }

    // removed
    for (const t of removed) {

      // -1 count
      const tagsRef = doc(docRef.firestore, tagsDoc + '/' + t);
      const tagsSnap = await getDoc(tagsRef);

      if ((tagsSnap.data() as any).count == 1) {
        batch.delete(tagsRef);
      } else {
        batch.update(
          tagsRef,
          { count: increment(-1), _tmpDoc: docRef }
        );
      }
    }
    batch.commit();
  }
}
