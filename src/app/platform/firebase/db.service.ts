import { Injectable } from '@angular/core';

import {
  doc,
  deleteDoc,
  Firestore,
  setDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  docData,
  docSnapshots,
  DocumentSnapshot,
  updateDoc
} from '@angular/fire/firestore';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/auth/user.model';
import { Post } from 'src/app/post/post.model';
import { FirestoreToolsService } from './firestore-tools.service';

//
// Update Database Functions
//
@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(
    private afs: Firestore,
    private tools: FirestoreToolsService
  ) { }

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
  async setPost(data: Post, id = this.tools.getId(), publish = false): Promise<string> {

    // create author doc ref
    if (data.authorId) {
      data.authorDoc = doc(this.afs, 'users', data.authorId);
    }

    // get doc refs
    const docRef = doc(this.afs, 'posts', id);
    const draftRef = doc(this.afs, 'drafts', id);
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data() as Post;

    // remove tags from update
    let { tags, ...tmp } = data;

    if (publish) {
      data = tmp;
    }

    if (publish) {

      // save changes
      await this.tools.setWithCounter(
        docRef,
        data,
        { merge: true },
        data.authorId
      );

      // delete draft doc
      await this.tools.deleteWithCounter(draftRef);

      // update tags
      const beforeTags = docData ? docData.tags : [];
      this.tools.updateTags(
        doc(this.afs, 'posts/' + id),
        beforeTags,
        tags
      );
    } else {

      // save draft
      await this.tools.setWithCounter(
        draftRef,
        data,
        { merge: true }
      );
    }

    return id;
  }
  /**
   * Delete Post by ID
   * @param id
   */
  async deletePost(id: string, uid: string): Promise<void> {
    await this.tools.deleteWithCounter(
      doc(this.afs, 'posts', id),
      uid
    );
  }
  /**
   * Add image to post doc
   * @param id
   * @param val
   * @param publish
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
   * @param val
   * @param publish
   */
  async deletePostImage(id: string, url: string): Promise<void> {
    await updateDoc(
      doc(this.afs, 'drafts', id),
      { imageUploads: arrayRemove(url) }
    );
  }
  /**
   * Create Post Index
   * @param id
   * @param data
   */
  async indexPost(id: string, data: any) {
    await this.tools.searchIndex({
      ref: doc(this.afs, 'posts', id),
      after: data,
      fields: ['content', 'title', 'tags']
    });
  }
}
