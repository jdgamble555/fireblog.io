import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { PostEditModule } from '@db/post-edit.module';
import { Post } from '@post/post.model';
import { MarkdownService } from 'ngx-markdown';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: PostEditModule
})
export class PostEditService {

  constructor(
    private markdownService: MarkdownService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  /**
   * Edit an existing post / create new post
   * @param id doc id
   * @param data doc data
   * @returns void
   */
  async setPost(data: Post, id = this.getId(), publish = false): Promise<string> {

    const authorId = data.authorId;

    return id;
  }
  /**
   * Delete Post by ID
   * @param id
   */
  async deletePost(id: string, uid: string): Promise<void> {

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

  }
  /**
   * Delete image from post doc
   * @param id
   * @param url
   */
  async deletePostImage(id: string, url: string): Promise<void> {

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

  }
}
