import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  DocumentData,
  DocumentSnapshot,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QuerySnapshot,
  Timestamp,
  where
} from '@angular/fire/firestore';
import { UserRec } from '@auth/user.model';
import { DbModule } from '@db/db.module';
import { expandRef, expandRefs, soundex } from '@db/fb-tools';
import { UserDbService } from '@db/user/user-db.service';
import { Post, PostInput } from '@post/post.model';
import { combineLatest, firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { ActionDbService } from './action-db.service';
import { TagDbService } from './tag-db.service';


@Injectable({
  providedIn: DbModule
})
export class PostDbService {

  constructor(
    private afs: Firestore,
    private as: ActionDbService,
    private ts: TagDbService,
    private us: UserDbService
  ) { }

  /**
  * Get a total count for the collection
  * @param col - Collection Path
  * @returns - total count
  */
  async getTotal(col: string): Promise<{ data: string | null, error: string | null }> {
    let error, data = null;
    try {
      data = await getDoc(
        doc(this.afs, '_counters', col)
      ).then((r) => r.exists() ? r.data()?.count : null);
    } catch (e: any) {
      error = e;
    }
    return { error, data };
  }


  private subTotal(col: string): Observable<string> {
    return docData<any>(
      doc(this.afs, '_counters', col)
    ).pipe(
      map((r: any) => r ? r.count : null)
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

  async getPostById(id: string, user?: UserRec): Promise<{ data: Post | null, error: string | null }> {

    // todo - do without SubPostId
    let data = null;
    let error = null;
    try {
      data = await firstValueFrom(this.subPostById(id, user));
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  /**
   * Get Post by post id
   * @param id post id
   * @returns post observable joined by author doc
   */
  private subPostById(id: string, user?: UserRec): Observable<Post | null> {
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
              this.as.subAction(id, user.uid, 'hearts'),
              this.as.subAction(id, user.uid, 'bookmarks')
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
  async getPostBySlug(slug: string): Promise<{ error?: any, data: Post | null }> {
    let error = null;
    let data = null;
    try {
      data = await getDocs<Post>(
        query<Post>(
          collection(this.afs, 'posts') as CollectionReference<Post>,
          where('slug', '==', slug),
          limit(1)
        )
      ).then((snap: QuerySnapshot<Post>) => {
        const doc = snap.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Post;
      });
    }
    catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  /**
 * Search posts by term
 * @param term
 * @returns Observable of search
 */
  async searchPost(term: string): Promise<{ data: Post[] | null, error: string | null }> {
    term = term.split(' ')
      .map(
        (v: string) => soundex(v)
      ).join(' ');
    let data = null;
    let error = null;
    try {
      data = await getDocs<Post>(
        query<Post>(
          collection(this.afs, '_search/posts/_all'),
          orderBy('_term.' + term)
        )
      ).then((data) => {
        if (!data.empty) {
          const docs: Post[] = [];
          for (const doc of data.docs) {
            docs.push({ id: doc.id, ...doc.data() });
          }
          if (docs.length > 0) {
            return docs;
          }
        }
        return null;
      });
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  async getPosts({
    sortField = 'createdAt',
    sortDirection = 'desc',
    pageSize = 5,
    authorId,
    page = 1,
    tag,
    uid,
    field,
    drafts = false
  }: PostInput = {}) {

    const { error, posts, count } = this.subPosts({
      sortField,
      sortDirection,
      pageSize,
      authorId,
      page,
      tag,
      uid,
      field,
      drafts
    });

    return {
      error,
      posts: await firstValueFrom(posts),
      count: await firstValueFrom(count)
    };

  }

  /**
   * Gets all posts
   * @returns posts joined by authorDoc
   */
  private subPosts({
    sortField = 'createdAt',
    sortDirection = 'desc',
    pageSize = 5,
    authorId,
    page = 1,
    tag,
    uid,
    field,
    drafts = false
  }: PostInput = {}): {
    count: Observable<string | null>,
    posts: Observable<Post[] | null>,
    error: string | null
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

    let posts: Observable<Post[] | null> = of(null);
    let count = null;
    let error = null;

    try {
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
                    this.as.subAction(_p.id, uid, 'hearts'),
                    this.as.subAction(_p.id, uid, 'bookmarks')
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

      // convert date types for ssr
      posts = posts.pipe(map((p: Post[] | null) => p
        ? p.map((data: any) => ({
          ...data,
          createdAt: (data?.createdAt as Timestamp)?.toMillis() || 0,
          updatedAt: (data?.updatedAt as Timestamp)?.toMillis() || 0,
        }))
        : null
      ));

    } catch (e: any) {
      error = e;
    }

    if (drafts) {
      field = 'drafts';
    }

    // count
    if (uid && field) {
      count = this.us.subUserTotal(uid, field);
    } else if (tag) {
      count = this.ts.subTagTotal(tag);
    } else {
      count = this.subTotal('posts');
    }

    count = count.pipe(
      map((total: string) =>
        total == '0' || total === undefined
          ? 'none'
          : total
      ));

    return {
      posts,
      count,
      error
    };
  }
}
