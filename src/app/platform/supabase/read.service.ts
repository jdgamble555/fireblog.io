import { Injectable } from '@angular/core';
import { UserRec } from '@auth/user.model';
import { Post, Tag } from '@post/post.model';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { DbModule } from './db.module';
import { sb_User, SupabaseService } from './supabase.service';


@Injectable({
  providedIn: DbModule
})
export class ReadService {

  userRec: Observable<UserRec | null>;

  constructor(
    private auth: AuthService,
    private sb: SupabaseService
  ) {

    // get user doc if logged in
    this.userRec = this.userSub();
  }

  //
  // User
  //

  async getUsernameFromId(uid: string) {
    let username = null;
    let error = null;
    return { username, error };
  }

  async getUserRec(): Promise<UserRec | null> {
    const id = this.sb.supabase.auth.user()?.id;
    const { data: user, error } = await this.sb.supabase.from('profiles').select('*').eq('id', id).single();
    if (error) {
      console.error(error);
    }
    return user ? this.mapUser(user) : null;
  }

  private mapUser(user: sb_User): UserRec {
    return ({
      uid: user?.id,
      photoURL: user?.photo_url,
      displayName: user?.display_name,
      createdAt: user?.created_at,
      updatedAt: user?.updated_at,
      username: user?.username
    });
  }

  userSub(): Observable<UserRec | null> {
    return this.auth.user$.pipe(
      switchMap((user: any | null) =>
        user
          ? this.sb.subWhere('profiles', 'id', user?.uid)
          : of(null)
      ),
      map((user: sb_User) => this.mapUser(user))
    );
  }

  /**
   * Get a total count for the collection
   * @param col - Collection Path
   * @returns - total count
   */
  async getTotal(col: string): Promise<{ data: string | null, error: string | null }> {
    let data = null;
    let error = null;
    return { data, error };
  }
  /**
   * Get all tags and their count
   * @returns tags
   */
  async getTags(): Promise<{ data: Tag[] | null, error: string | null }> {
    let data: Post | null = null;
    let error = null;
    return { error, data };
  }
  /**
   * Get tag count from tag doc
   * @param t - tag
   * @returns
   */
  getTagTotal(t: string): Observable<string> {
    return of('');
  }

  /**
   * Return total number of docs by a user
   * @param uid - user id
   * @param col - column
   * @returns
   */
  getUserTotal(uid: string, col: string): Observable<string> {
    return of('');
  }

  //
  // Hearts and Bookmarks
  //

  async actionPost(postId: string, userId: string, action: string): Promise<{ error: string | null }> {
    let error = null;
    return { error };
  }

  async unActionPost(postId: string, userId: string, action: string): Promise<{ error: string | null }> {
    let error = null;
    return { error };
  }

  async getActionExists(id: string, uid: string, action: string): Promise<{ data: boolean | null, error: string | null }> {
    let data = null;
    let error = null;
    return { data, error };
  }
  //
  // Posts
  //

  /**
  * Search posts by term
  * @param term
  * @returns Observable of search
  */
  async searchPost(term: string): Promise<{ data: Post[] | null, error: string | null }> {
    let data = null;
    let error = null;
    return { data, error };
  }
  /**
   * Gets all posts
   * @returns posts joined by authorDoc
   */
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
  } = {}): Promise<{
    count: string | null,
    posts: Post[] | null,
    error: string | null
  }> {
    let count = null;
    let posts = null;
    let error = null;
    const _limit = page * pageSize;
    const _offset = (page - 1) * pageSize;
    return { count, posts, error };
  }


  /**
   * Get Post by post id
   * @param id post id
   * @returns post observable joined by author doc
   */
  async getPostById(id: string, user?: UserRec): Promise<{ error: string | null, data: Post | null }> {
    let data: Post | null = null;
    let error = null;
    return { error, data };
  }
  /**
   * SEO by Post ID
   * @param id
   * @returns
   */
  async seoPostById(id: string): Promise<Post | undefined> {
    return;
  }
  /**
   * Get post by slug, use is mainly for backwards compatibility
   * @param slug
   * @returns
   */
  async getPostBySlug(slug: string): Promise<{ error: string | null, data: Post | null }> {
    let data: Post | null = null;
    let error = null;
    return { error, data };
  }
}
