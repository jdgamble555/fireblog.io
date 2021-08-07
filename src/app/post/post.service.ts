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
  getPosts(): Observable<Post[]> {
    let data: Post[];
    return this.afs.collection<Post>('posts').valueChanges({ idField: 'id' }).pipe(
      switchMap((r: Post[]) => {
        data = r;
        const docs = r.map(
          (d: Post) => this.afs.doc<User>(`users/${d.authorId}`).valueChanges()
        );
        return combineLatest(docs).pipe(
          map((arr: any) => arr.reduce((acc: any, cur: any) => [acc].concat(cur)))
        );
      }),
      map((d: User[]) => {
        let i = 0;
        return d.map(
          (doc: User) => { return { ...data[i++], author: doc }; }
        );
      })
    );
  }
  /**
   * Get Post by post id
   * @param id post id
   * @returns post observable
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
   * Edit an existing post
   * @param id doc id
   * @param data doc data
   * @returns void
   */
  async setPost(data: Post, id = this.getId()): Promise<void> {
    return await this.afs.collection<Post>('posts').doc(id).set(data, { merge: true });
  }
  /**
   * Delete's an image from post doc
   * @param id doc id
   * @returns
   */
  async deleteImage(id: string) {
    return await this.afs.doc<Post>(`posts/${id}`).update({
      image: firebase.firestore.FieldValue.delete()
    });
  }
}
