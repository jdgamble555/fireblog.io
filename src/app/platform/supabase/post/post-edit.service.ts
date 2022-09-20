import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { PostEditModule } from '@db/post-edit.module';
import { Post } from '@post/post.model';
import { MarkdownService } from 'ngx-markdown';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: PostEditModule
})
export class PostEditService {

  constructor(
    private markdownService: MarkdownService,
    @Inject(DOCUMENT) private document: Document,
    private sb: SupabaseService
  ) { }

  /**
   * Edit an existing post / create new post
   * @param id doc id
   * @param data doc data
   * @returns void
   */
  async setPost(data: Post, id: string | undefined = undefined, publish = false): Promise<{ error: any, data: any | null }> {
    // todo - figure out how to get rid of getId() and possibly enable images in UI normally

    if (publish && id) {
      const { error } = await this.deletePost(id);
      if (error) {
        console.error(error);
      }
    }

    // todo - add sb_post type

    let new_data: any = {
      title: data.title,
      author: data.authorId,
      content: data.content,
      image: data.image,
      imageUploads: data.imageUploads,
      slug: data.slug,
      minutes: data.minutes,
      published: publish
    };
    if (id) {
      new_data = { ...new_data, id };
    }
    const { error, data: _data } = await this.sb.supabase.from('posts').upsert(new_data).select().single();
    return { error, data: _data };
  }
  /**
   * Delete Post by ID
   * @param id
   */
  async deletePost(id: string, published = true): Promise<{ error: any }> {
    const { error } = await this.sb.supabase.from('posts').delete().eq('id', id).eq('published', published);
    return { error };
  }
  //
  // Images
  //

  /**
   * Add image to post doc
   * @param id
   * @param url
   */
  async addPostImage(id: string, url: string): Promise<{ error: any }> {
    let error = null;
    return { error };
  }
  /**
   * Delete image from post doc
   * @param id
   * @param url
   */
  async deletePostImage(id: string, url: string): Promise<{ error: any }> {
    let error = null;
    return { error };
  }

  //
  // Search Index
  //

  /**
   * Create Post Index
   * @param id
   * @param data
   */
  async indexPost(id: string, data: any): Promise<{ error: any }> {
    let error = null;
    return { error };
  }
}
