import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentReference,
  Firestore,
  getDoc,
  increment,
  updateDoc,
  writeBatch
} from '@angular/fire/firestore';
import { deleteWithCounter, searchIndex, setWithCounter } from '@db/fb-tools';
import { PostEditModule } from '@db/post-edit.module';
import { UserDbService } from '@db/user/user-db.service';
import { Post } from '@post/post.model';
import { MarkdownService } from 'ngx-markdown';

@Injectable({
  providedIn: PostEditModule
})
export class PostEditService {

  constructor(
    private afs: Firestore,
    private markdownService: MarkdownService,
    private us: UserDbService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  /**
   * Edit an existing post / create new post
   * @param id doc id
   * @param data doc data
   * @returns void
   */
  async setPost(data: Post, id = this.getId(), publish = false): Promise<{ error: any, data: any | null }> {
    let error = null;
    let _data: any = null;
    try {
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
          // todo - update tages normally
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
      _data = { ...data, id };
    } catch (e: any) {
      error = e;
    }
    return { error, data: _data };
  }
  /**
   * Delete Post by ID
   * @param id
   */
  async deletePost(id: string): Promise<{ error: any }> {
    let { data: user, error } = await this.us.getUser();
    if (error) {
      console.error(error);
    }
    const uid = user?.uid;
    if (uid) {
      try {
        await deleteWithCounter(
          doc(this.afs, 'posts', id),
          { paths: { users: uid } }
        );
      } catch (e: any) {
        error = e;
      }
    }
    return { error };
  }
  //
  // Images
  //

  /**
   * Add image to post doc
   * @param id
   * @param url
   */
  async addPostImage(id: string, url: string): Promise<{ error: any }> {
    let error = null;
    try {
      await updateDoc(
        doc(this.afs, 'drafts', id),
        { imageUploads: arrayUnion(url) }
      );
    } catch (e: any) {
      error = e;
    }
    return { error };
  }
  /**
   * Delete image from post doc
   * @param id
   * @param url
   */
  async deletePostImage(id: string, url: string): Promise<{ error: any }> {
    let error = null;
    try {
      await updateDoc(
        doc(this.afs, 'drafts', id),
        { imageUploads: arrayRemove(url) }
      );
    } catch (e: any) {
      error = e;
    }
    return { error };
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
  async indexPost(id: string, data: any): Promise<{ error: any }> {
    let error = null;
    try {
      await searchIndex(this.document, {
        ref: doc(this.afs, 'posts', id),
        after: data,
        fields: ['content', 'title', 'tags']
      });
    } catch (e: any) {
      error = e;
    }
    return { error };
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
  ): Promise<{ error: any }> {

    let error = null;
    try {
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
    } catch (e: any) {
      error = e;
    }
    return { error };
  }
}
