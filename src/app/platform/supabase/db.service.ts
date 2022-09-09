import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { UserRec } from '@auth/user.model';
import { Post } from '@post/post.model';
import { MarkdownService } from 'ngx-markdown';
import { Observable, of } from 'rxjs';
import { DbModule } from './db.module';
import { SupabaseService } from './supabase.service';


@Injectable({
  providedIn: DbModule
})
export class DbService {

  constructor(
    private markdownService: MarkdownService,
    @Inject(DOCUMENT) private document: Document,
    private sb: SupabaseService
  ) { }
  //
  // User
  //

  getUsername(uid: string): Observable<string | null> {
    return of(null);
  }

  async hasUsername(uid: string): Promise<{ data: boolean | null, error: string | null }>  {
    let data = null;
    let error = null;
    return { data, error };
  }

  async validUsername(name: string): Promise<{ data: boolean | null, error: string | null }> {
    let data = null;
    let error = null;
    return { data, error };
  }

  async updateUsername(username: string, uid: string, currentUsername?: string): Promise<any> {
    return;
  }

  async createUser(): Promise<void> {
    const user = this.sb.supabase.auth.user();
    const { data, error } = await this.sb.supabase.from('profiles').upsert({
      id: user?.id,
      photo_url: user?.user_metadata['avatar_url'],
      //phoneNumber: u.phone,
      display_name: user?.user_metadata['full_name']
    });
    if (error) {
      console.log(error);
    }
    return;
  }

  async updateUser(user: any, id: string): Promise<void> {
    return;
  }

  async deleteUser(id: string): Promise<void> {
    return;
  }
  //
  // Posts
  //

  /**
    * Get latest version of post
    * @param id
    * @returns
    */
  async getPostData(id: string): Promise<{ error: string | null, data: Post | null }> {
    let error = null;
    let data = null;
    return { error, data };
  }
  /**
   * Edit an existing post / create new post
   * @param id doc id
   * @param data doc data
   * @returns void
   */
  async setPost(data: Post, id = this.getId(), publish = false): Promise<string> {
    return '';
  }
  /**
   * Delete Post by ID
   * @param id
   */
  async deletePost(id: string, uid: string): Promise<void> {
    return;
  }
  //
  // Images
  //

  /**
   * Add image to post doc
   * @param id
   * @param url
   */
  async addPostImage(id: string, url: string): Promise<void> {
    return;
  }
  /**
   * Delete image from post doc
   * @param id
   * @param url
   */
  async deletePostImage(id: string, url: string): Promise<void> {
    return;
  }

  /**
  * Generates an id for a new firestore doc
  * @returns
  */
  getId(): string {
    return '';
  }

  //
  // Search Index
  //

  /**
   * Create Post Index
   * @param id
   * @param data
   */
  async indexPost(id: string, data: any): Promise<void> {
    return;
  }

}
