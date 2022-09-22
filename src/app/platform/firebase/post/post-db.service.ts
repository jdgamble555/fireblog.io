import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where
} from '@angular/fire/firestore';
import { UserRec } from '@auth/user.model';
import { DbModule } from '@db/db.module';
import { expandRefs, soundex } from '@db/fb-tools';
import { Post, PostInput } from '@post/post.model';
import { snapToData } from 'rxfire/firestore';
import { firstValueFrom, map, Observable, of } from 'rxjs';


@Injectable({
  providedIn: DbModule
})
export class PostDbService {

  constructor(
    private afs: Firestore
  ) { }

  /**
  * Get a total count for the collection
  * @param col - Collection Path
  * @returns - total count
  */
  async getTotal(col: string): Promise<{ data: string | null, error: any }> {
    let error, data = null;
    try {
      data = await getDoc(
        doc(this.afs, '_counters', col)
      ).then(r => r.exists() ? r.data()?.count : null);
    } catch (e: any) {
      error = e;
    }
    return { error, data };
  }

  async getPostData(id: string): Promise<{ error: any, data: Post | null }> {
    const docRef = doc(this.afs, 'posts', id);
    const draftRef = doc(this.afs, 'drafts', id);

    let error, data = null;
    try {
      data = await getDoc<Post>(draftRef)
        .then(snap => snap.exists()
          ? getDoc(draftRef)
          : getDoc(docRef))
        .then(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e: any) {
      error = e;
    }
    return { error, data };
  }

  async getPostById(id: string, user?: UserRec): Promise<{ data: Post | null, error: any }> {

    let data = null;
    let error = null;
    try {
      data = await getDoc<Post>(
        doc(this.afs, 'posts', id)
      ).then(postSnap => snapToData<Post>(postSnap, { idField: 'id' }) as Post)
        .then(async postData => {
          const authorData = await getDoc<UserRec>(postData.authorDoc)
            .then(authorSnap => snapToData<UserRec>(authorSnap, { idField: 'id' }));
          return {
            ...postData,
            authorDoc: authorData,
            createdAt: (postData?.createdAt as Timestamp)?.toMillis() || 0,
            updatedAt: (postData?.updatedAt as Timestamp)?.toMillis() || 0
          };
        });
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }

  /**
   * Get post by slug, use is mainly for backwards compatibility
   * @param slug
   * @returns
   */
  async getPostBySlug(slug: string): Promise<{ error: any, data: Post | null }> {
    let error = null;
    let data = null;
    try {
      data = await getDocs<Post>(
        query<Post>(
          collection(this.afs, 'posts') as CollectionReference<Post>,
          where('slug', '==', slug),
          limit(1)
        )
      ).then(arr => arr.empty ? null : arr.docs.map(snap => snapToData<Post>(snap, { idField: 'id' }) as Post)[0]);
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
  async searchPost(term: string): Promise<{ data: Post[] | null, error: any }> {
    term = term.split(' ')
      .map(v => soundex(v)
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
  }: PostInput = {}): Promise<{ error: any, data: Post[] | null, count: string | null }> {

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
      data: await firstValueFrom(posts),
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
    error: any
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
              map(p => p.map((s: any) => s.postDoc)),
              // offset is only okay here because of caching
              map(l => l.slice(_offset))
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
            map(l => l.slice(_offset))
          ), ['authorDoc']);
      }

      // convert date types for ssr
      posts = posts.pipe(map(p =>
        p ? p.map(data =>
        ({
          ...data,
          createdAt: (data?.createdAt as Timestamp)?.toMillis() || 0,
          updatedAt: (data?.updatedAt as Timestamp)?.toMillis() || 0,
        })) : null
      ));

    } catch (e: any) {
      error = e;
    }

    if (drafts) {
      field = 'drafts';
    }

    // count
    if (uid && field) {
      count = this.subUserTotal(uid, field);
    } else if (tag) {
      count = this.subTagTotal(tag);
    } else {
      count = this.subTotal('posts');
    }

    count = count.pipe(
      map(total =>
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

  private subUserTotal(uid: string, col: string): Observable<string> {
    return docData<any>(
      doc(this.afs, 'users', uid)
    ).pipe(
      map(r => r ? r[col + 'Count'] : null)
    );
  }

  private subTotal(col: string): Observable<string> {
    return docData<any>(
      doc(this.afs, '_counters', col)
    ).pipe(
      map(r => r ? r.count : null)
    );
  }

  private subTagTotal(t: string): Observable<string> {
    return docData<any>(
      doc(this.afs, 'tags', t)
    ).pipe(
      map((r: any) => r ? r.count : null)
    );
  }
}
