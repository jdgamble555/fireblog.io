import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../auth/user.model';
import { Post } from './post.model';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private afs: AngularFirestore) { }

  /**
   * Gets all posts
   * @returns posts joined by authorDoc
   */
  getPosts(fieldSort = 'createdAt'): Observable<Post[]> {
    let data: Post[];
    return this.afs.collection<Post>('posts', ref => ref.orderBy(fieldSort)).valueChanges({ idField: 'id' }).pipe(
      switchMap((r: Post[]) => {
        data = r;
        const docs = r.map(
          (d: Post) => this.afs.doc<User>(`users/${d.authorId}`).valueChanges()
        ) as Observable<User>[];
        return combineLatest(docs);
      }),
      map((d: User[]) => {
        let i = 0;
        return d.map(
          (doc: User) => {
            return { ...data[i++], author: doc };
          }
        );
      })
    );
  }
  /**
   * Get Post by post id
   * @param id post id
   * @returns post observable joined by author doc
   */
  getPostById(id: string): Observable<Post> {
    let data: Post;
    return (this.afs.doc<Post>('posts' + '/' + id).valueChanges() as Observable<Post>)
      .pipe(
        switchMap((r: Post) => {
          data = r;
          return this.afs.doc<User>(`users/${r.authorId}`).valueChanges() as Observable<User>;
        }),
        map((d: User) => { return { ...data, author: d, id } })
      );
  }
  /**
   * Generates an id for a new firestore doc
   * @returns
   */
  getId() {
    return this.afs.createId();
  }

  /**
   * Generates a server timestamp
   * @returns
   */
  getDate(): firebase.firestore.FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  /**
   * Edit an existing post
   * @param id doc id
   * @param data doc data
   * @returns void
   */
  async setPost(data: Post, id?: string): Promise<string> {
    if (data.id !== 'undefined' || id) {
      if (data.id) {
        // take id out of data
        id = data.id;
        delete data.id;
      }
    } else {
      // generate id if there is none
      id = this.getId();
    }
    // add or update firestore
    try {
      await this.afs.collection<Post>('posts').doc(id).set(data, { merge: true });
      return id as string;
    } catch (e) {
      console.error(e);
    }
    return '';
  }
  /**
   * Delete's an image from post doc
   * @param id doc id
   * @returns
   */
  async deleteImage(id: string): Promise<string> {
    const image = firebase.firestore.FieldValue.delete();
    return await this.setPost({ image }, id);
  }

  async addPostImage(id: string, val: string): Promise<string> {
    const imageUploads = firebase.firestore.FieldValue.arrayUnion(val);
    return await this.setPost({ imageUploads }, id);
  }

  async deletePostImage(id: string, val: string): Promise<string> {
    const imageUploads = firebase.firestore.FieldValue.arrayRemove(val);
    return await this.setPost({ imageUploads }, id);
  }

}
