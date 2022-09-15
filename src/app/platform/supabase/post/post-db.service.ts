import { Injectable } from '@angular/core';
import { UserRec } from '@auth/user.model';
import { DbModule } from '@db/db.module';
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
    private as: ActionDbService,
    private ts: TagDbService,
    private us: UserDbService
  ) { }

  /**
  * Get a total count for the collection
  * @param col - Collection Path
  * @returns - total count
  */
  async getTotal(col: string): Promise<{ data: string | null, error:any }> {
    let error = null;
    let data = null;
    return { error, data };
  }

  async getPostData(id: string): Promise<{ error: any, data: Post | null }> {
    let error = null;
    let data = null;
    return { error, data };
  }

  async getPostById(id: string, user?: UserRec): Promise<{ data: Post | null, error: any }> {

    let data = null;
    let error = null;
    return { data, error };
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
  async getPostBySlug(slug: string): Promise<{ error: any, data: Post | null }> {
    let error = null;
    let data = null;
    return { data, error };
  }

  /**
 * Search posts by term
 * @param term
 * @returns Observable of search
 */
  async searchPost(term: string): Promise<{ data: Post[] | null, error: any }> {
    let data = null;
    let error = null;
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

    let error = null;
    let posts = null;
    let count = null;

    return {
      error,
      posts,
      count
    };

  }
}
