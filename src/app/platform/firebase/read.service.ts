import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  DocumentReference,
  Firestore,
  orderBy,
  Timestamp,
  query,
  where,
  limit,
  getDoc,
  DocumentSnapshot,
  docSnapshots
} from '@angular/fire/firestore';
import { UserRec } from '@auth/user.model';
import { Post, Tag } from '@post/post.model';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  deleteWithCounter,
  expandRef,
  expandRefs,
  setWithCounter,
  soundex
} from './fb-tools';

@Injectable({
  providedIn: 'root'
})
export class ReadService {

  userRec: Observable<UserRec | null>;

  constructor(
    private afs: Firestore,
    private auth: AuthService
  ) {

    // get user doc if logged in
    this.userRec = this.userSub();
  }

  //
  // User
  //

  userSub(): Observable<UserRec | null> {
    return this.auth.user$.pipe(
      switchMap((user: User | null) =>
        user
          ? this.subUser(user.uid)
          : of(null)
      )
    );
  }

  subUser(id: string): Observable<UserRec> {
    return docData<UserRec>(
      doc(this.afs, 'users', id) as DocumentReference<UserRec>,
      { idField: 'uid' }
    );
  }

  async getUser(): Promise<UserRec | null> {
    const id = (await this.auth.getUser())?.uid;
    if (id) {
      const docSnap = await getDoc<UserRec>(
        doc(this.afs, 'users', id) as DocumentReference<UserRec>
      );
      if (docSnap.exists()) {
        return docSnap.data();
      }
    }
    return null;
  }

  /**
   * Return total number of docs by a user
   * @param uid - user id
   * @param col - column
   * @returns
   */
  getUserTotal(uid: string, col: string): Observable<string> {
    return docData<any>(
      doc(this.afs, 'users', uid)
    ).pipe(
      map((r: any) => r ? r[col + 'Count'] : null)
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
        map((r: any) => r ? r.count : null)
      );
    }
    /**
     * Get all tags and their count
     * @returns tags
     */
    getTags(): Observable<Tag[]> {
      return collectionData<Tag>(
        query<Tag>(
          collection(this.afs, 'tags')
        ), { idField: 'name' }
      );
    }
    /**
     * Get tag count from tag doc
     * @param t - tag
     * @returns
     */
    getTagTotal(t: string): Observable<string> {
      return docData<any>(
        doc(this.afs, 'tags', t)
      ).pipe(
        map((r: any) => r ? r.count : null)
      );
    }

  //
  // Hearts and Bookmarks
  //

  async actionPost(postId: string, userId: string, action: string): Promise<void> {
    await setWithCounter(
      doc(this.afs, action, `${postId}_${userId}`),
      {
        postDoc: doc(this.afs, 'posts', postId),
        userDoc: doc(this.afs, 'users', userId)
      },
      { merge: true },
      { paths: { posts: postId, users: userId } }
    );
  }

  async unActionPost(postId: string, userId: string, action: string): Promise<void> {
    await deleteWithCounter(
      doc(this.afs, action, `${postId}_${userId}`),
      { paths: { posts: postId, users: userId } }
    );
  }

  getAction(id: string, uid: string, action: string): Observable<boolean> {
    return docSnapshots(
      doc(this.afs, action, `${id}_${uid}`)
    ).pipe(
      map((snap: DocumentSnapshot<any>) => snap.exists())
    );
  }
  //
  // Posts
  //

  /**
  * Search posts by term
  * @param term
  * @returns Observable of search
  */
  searchPost(term: string): Observable<Post[]> {
    term = term.split(' ')
      .map(
        (v: string) => soundex(v)
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
  getPosts({
    sortField = 'createdAt',
    sortDirection = 'desc',
    pageSize = 5,
    authorId,
    page = 1,
    tag,
    uid,
    field,
    drafts = false
  }: {
    sortField?: string,
    sortDirection?: 'desc' | 'asc',
    tag?: string,
    uid?: string,
    authorId?: string,
    field?: string,
    page?: number,
    pageSize?: number,
    drafts?: boolean
  } = {}): {
    count: Observable<string>,
    posts: Observable<Post[]>
  } {

    const _limit = page * pageSize;
    const _offset = (page - 1) * pageSize;
    const filters = [
      orderBy(sortField, sortDirection)
    ];
    if (tag) {
      filters.push(
        where('tags', 'array-contains', tag)
      );
    }
    if (authorId && !field) {
      filters.push(
        where('authorId', '==', authorId)
      );
    }
    if (uid && field) {
      filters.push(
        where('userDoc', '==', doc(this.afs, 'users', uid))
      );
    }
    filters.push(
      limit(_limit)
    );

    /*filters.push(
      where('createdAt', '<', Timestamp.fromDate(new Date()))
    );*/

    let posts: Observable<Post[]>;
    let count: Observable<string>;

    // if posts by hearts or bookmarks
    if (field) {
      posts = expandRefs<Post>(
        expandRefs<Post>(
          collectionData<any>(
            query(
              collection(this.afs, field),
              ...filters
            ), { idField: 'id' }
          ), ['postDoc']).pipe(
            map((p: any) => p.map((s: any) => s.postDoc)),
            // offset is only okay here because of caching
            map((l: Post[]) => l.slice(_offset))
          ), ['authorDoc']);
    } else {

      // otherwise just posts
      posts = expandRefs<Post>(
        collectionData<Post>(
          query<Post>(
            collection(this.afs, drafts ? 'drafts' : 'posts') as CollectionReference<Post>,
            ...filters,
          ), { idField: 'id' }
        ).pipe(
          // offset is only okay here because of caching
          map((l: Post[]) => l.slice(_offset))
        ), ['authorDoc']);
    }

    // get user likes and bookmarks
    if (uid) {
      let _posts: Post[] = [];
      posts = posts.pipe(
        switchMap((r: Post[] | null) => {
          if (r && r.length > 0) {
            _posts = r;
            const actions: any[] = [];
            _posts.map((_p: Post) => {
              if (_p.id && uid) {
                actions.push(
                  this.getAction(_p.id, uid, 'hearts'),
                  this.getAction(_p.id, uid, 'bookmarks')
                );
              }
            });
            if (actions.length > 0) {
              return combineLatest(actions);
            }
          }
          return of(null);
        }),
        map((s: any[] | null) => {
          if (s && s.length > 0) {
            _posts.map((p: Post) => {
              p.liked = s.shift();
              p.saved = s.shift();
              return p;
            });
          }
          return _posts;
        })
      );
    }

    // count
    if (uid && field) {
      count = this.getUserTotal(uid, field);
    } else if (tag) {
      count = this.getTagTotal(tag);
    } else {
      count = this.getTotal('posts');
    }

    // convert date types for ssr
    posts = posts.pipe(map((p: Post[]) => p.map((data: any) => ({
      ...data,
      createdAt: (data?.createdAt as Timestamp)?.toMillis() || 0,
      updatedAt: (data?.updatedAt as Timestamp)?.toMillis() || 0,
    }))));

    count = count.pipe(
      map((total: string) =>
        total == '0' || total === undefined
          ? 'none'
          : total
      ));

    return { posts, count };
  }

  /**
   * Get Post by post id
   * @param id post id
   * @returns post observable joined by author doc
   */
  getPostById(id: string, user?: UserRec): Observable<Post | null> {
    let _post: Post | null;
    return expandRef<Post>(
      docData<Post>(
        doc(this.afs, 'posts', id)
      ), ['authorDoc']).pipe(
        // add id field, ssr dates
        map((p: Post) => p ? ({
          ...p,
          id,
          createdAt: (p?.createdAt as Timestamp)?.toMillis() || 0,
          updatedAt: (p?.updatedAt as Timestamp)?.toMillis() || 0,
        }) : null)
      ).pipe(
        switchMap((p: Post | null) => {
          _post = p;
          if (user && user.uid) {
            return combineLatest([
              this.getAction(id, user.uid, 'hearts'),
              this.getAction(id, user.uid, 'bookmarks')
            ]);
          }
          return of(null);
        }),
        map((p: [boolean, boolean] | null) => {
          if (p && _post) {
            // save liked and saved
            [_post.liked, _post.saved] = p;
          }
          return _post;
        })
      );
  }
  /**
   * SEO by Post ID
   * @param id
   * @returns
   */
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
    return collectionData<Post>(
      query<Post>(
        collection(this.afs, 'posts') as CollectionReference<Post>,
        where('slug', '==', slug),
        limit(1)
      ), { idField: 'id' }
    ).pipe(
      map((p: Post[]) => p ? p[0] : p)
    );
  }
}
