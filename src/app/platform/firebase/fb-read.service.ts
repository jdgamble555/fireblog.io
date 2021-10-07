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
  OrderByDirection,
  limit,
  getDoc
} from '@angular/fire/firestore';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';
import { User } from 'src/app/auth/user.model';
import { Post, Tag } from 'src/app/post/post.model';
import { AuthService } from '../mock/auth.service';
import { FirebaseModule } from './firebase.module';

@Injectable({
  providedIn: 'root'
})
export class FbReadService {

  userDoc: Observable<User | null>;

  constructor(
    private afs: Firestore,
    private auth: AuthService,
    private fm: FirebaseModule
  ) {

    // get user doc if logged in
    this.userDoc = this.auth.user$.pipe(
      switchMap((user: Auth | null) =>
        user
          ? this.getUser(user.uid)
          : of(null)
      )
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
   * Get tag count from tag doc
   * @param t - tag
   * @returns
   */
  getTagTotal(t: string) {
    return docData<any>(
      doc(this.afs, 'tags', t)
    ).pipe(
      map((r: any) => r.count)
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
  * Search posts by term
  * @param term
  * @returns Observable of search
  */
  searchPost(term: string) {
    term = term.split(' ')
      .map(
        (v: string) => this.fm.soundex(v)
      ).join(' ');
    return collectionData(
      query(
        collection(this.afs, '_search/posts/_all'),
        orderBy('_term.' + term),
      ),
      { idField: 'id' }
    ).pipe(
      take(1),
      debounceTime(100)
    );
  }
  /**
   * Gets all posts
   * @returns posts joined by authorDoc
   */
  getPosts<Post>(opts?: {
    sortField?: string,
    sortDirection?: OrderByDirection,
    tag?: string,
    uid?: string,
    page?: number,
    pageSize?: number
  }): Observable<Post[]> {
    opts = opts || {};
    opts.sortField = opts.sortField || 'createdAt';
    opts.sortDirection = opts.sortDirection || 'desc';
    opts.pageSize = opts.pageSize || 5;
    opts.page = opts.page || 1;

    const _limit = opts.page * opts.pageSize;
    const _offset = (opts.page - 1) * opts.pageSize;

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
    filters.push(
      limit(_limit)
    );
    return this.expandRefs<Post>(
      collectionData<Post>(
        query<Post>(
          collection(this.afs, 'posts') as CollectionReference<Post>,
          ...filters
        ), { idField: 'id' }
      ).pipe(
        // offset is only okay here because of caching
        map((l: Post[]) => l.slice(_offset))
      ), ['authorDoc']);
  }
  /**
   * Return total number of docs by a user
   * @param uid - user id
   * @param col - column
   * @returns
   */
  getUserTotal(uid: string, col: string) {
    return docData<any>(
      doc(this.afs, 'users', uid)
    ).pipe(
      map((r: any) => r[col + 'Count'])
    );
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

  async seoPostById(id: string): Promise<Post | undefined> {
    return (await getDoc(
      doc(this.afs, 'posts', id)
    )).data() as Post;
  }
  /**
   * Get post by slug, use is mainly for backwards compatibility
   * @param slug
   * @returns
   */
  getPostBySlug(slug: string): Observable<Post> {
    return this.expandRefs<Post>(
      collectionData<Post>(
        query<Post>(
          collection(this.afs, 'posts') as CollectionReference<Post>,
          where('slug', '==', slug),
          limit(1)
        ), { idField: 'id' }
      ), ['authorDoc']).pipe(
        map((p: Post[]) => p[0])
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
