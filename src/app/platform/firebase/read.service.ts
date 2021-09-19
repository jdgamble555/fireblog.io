import { Injectable } from '@angular/core';
import { User as Auth } from '@angular/fire/auth';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  DocumentReference,
  Firestore,
  orderBy,
  query,
  where,
  OrderByDirection
} from '@angular/fire/firestore';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/app/auth/user.model';
import { Post, Tag } from 'src/app/post/post.model';
import { AuthService } from './auth.service';

//
// Read Database Functions
//

@Injectable({
  providedIn: 'root'
})
export class ReadService {

  userDoc: Observable<User | null>;

  constructor(
    private afs: Firestore,
    private auth: AuthService
  ) {

    // get user doc if logged in
    this.userDoc = this.auth.user$.pipe(
      switchMap((user: Auth | null) => user ? this.getUser(user.uid) : of(null))
    );
  }
  /**
   * Get a total count for the collection
   * @param col - Collection Path
   * @returns - total count
   */
  getTotal(col: string): Observable<string> {
    return docData<any>(
      doc(this.afs, '_counters', col)
    ).pipe(
      map((r: any) => r.count)
    );
  }
  /**
   * Get all tags and their count
   * @returns tags
   */
  getTags(): Observable<Tag[]> {
    return collectionData<Tag>(
      query<Tag>(
        collection(this.afs, 'tags'),
      ), { idField: 'name' }
    );
  }
  /**
   * Get user document
   * @param id
   * @returns
   */
  getUser(id: string): Observable<User> {
    return docData<User>(
      doc(this.afs, 'users', id) as DocumentReference<User>
    );
  }
  /**
   * Get all posts from a certain uid
   * @param uid
   * @returns
   */
  getPostsByUser<Post>(uid: string): Observable<Post[]> {
    return this.getPosts({ uid });
  }
  /**
   * Get all posts with a certain tag
   * @param tag
   * @returns
   */
  getPostsByTag<Post>(tag: string): Observable<Post[]> {
    return this.getPosts({ tag });
  }
  /**
   * Gets all posts
   * @returns posts joined by authorDoc
   */
  getPosts<Post>(opts?: {
    sortField?: string,
    sortDirection?: OrderByDirection,
    tag?: string,
    uid?: string
  }): Observable<Post[]> {
    opts = opts || {};
    opts.sortField = opts.sortField || 'createdAt';
    opts.sortDirection = opts.sortDirection || 'desc';
    const filters = [
      orderBy(opts.sortField, opts.sortDirection)
    ];
    if (opts.tag) {
      filters.push(
        where('tags', 'array-contains', opts.tag)
      );
    }
    if (opts.uid) {
      filters.push(
        where('authorId', '==', opts.uid)
      );
    }
    return this.expandRefs<Post>(
      collectionData<Post>(
        query<Post>(
          collection(this.afs, 'posts') as CollectionReference<Post>,
          ...filters
        ), { idField: 'id' }
      ), ['authorDoc']);
  }
  /**
   * Get Post by post id
   * @param id post id
   * @returns post observable joined by author doc
   */
  getPostById(id: string): Observable<Post> {
    return this.expandRef<Post>(
      docData<Post>(
        doc(this.afs, 'posts', id)
      ), ['authorDoc']).pipe(
        // add id field
        map((p: Post) => p ? { ...p, id } : p)
      );
  }
  //
  // Tools
  //

  expandRef<T>(obs: Observable<T>, fields: any[] = []): Observable<T> {
    return obs.pipe(
      switchMap((doc: any) => doc ? combineLatest(
        (fields.length === 0 ? Object.keys(doc).filter(
          (k: any) => {
            const p = doc[k] instanceof DocumentReference;
            if (p) fields.push(k);
            return p;
          }
        ) : fields).map((f: any) => docData<any>(doc[f]))
      ).pipe(
        map((r: any) => fields.reduce(
          (prev: any, curr: any) =>
            ({ ...prev, [curr]: r.shift() })
          , doc)
        )
      ) : of(doc))
    );
  }

  expandRefs<T>(obs: Observable<T[]>, fields: any[] = []): Observable<T[]> {
    return obs.pipe(
      switchMap((col: any[]) =>
        col.length !== 0 ? combineLatest(col.map((doc: any) =>
          (fields.length === 0 ? Object.keys(doc).filter(
            (k: any) => {
              const p = doc[k] instanceof DocumentReference;
              if (p) fields.push(k);
              return p;
            }
          ) : fields).map((f: any) => docData<any>(doc[f]))
        ).reduce((acc: any, val: any) => [].concat(acc, val)))
          .pipe(
            map((h: any) =>
              col.map((doc2: any) =>
                fields.reduce(
                  (prev: any, curr: any) =>
                    ({ ...prev, [curr]: h.shift() })
                  , doc2
                )
              )
            )
          ) : of(col)
      )
    );
  }
}
