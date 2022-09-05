import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ReadService } from '@db/read.service';
import { Post } from '@post/post.model';

export type PostType =  'bookmarks' | 'liked' | 'updated' | 'user' | 'drafts' | 'new' | 'tag' | null;


@Injectable({
  providedIn: 'root'
})
export class PostListService {

  type: PostType;

  constructor(
    private read: ReadService,
    private router: Router
  ) {
    this.type = null;
  }

  async getPosts({ uid, username, tag }:
    { uid?: string, username?: string, tag?: string } = {})
    : Promise<{ posts: Post[] | null, count: string | null }> {

    let count: string | null = null;
    let posts: Post[] | null = null;
    let error: string | null = null;

    // username checks
    if (uid) {
      const { username: currentUsername, error: _e } = await this.read.getUsernameFromId(uid);
      if (_e) {
        error = _e;
      }
      // if no username in db
      if (!currentUsername) {

        // invalid id, go home
        this.router.navigate(['/']);
        return { posts, count };
      }
      // if no username in route, or invalid username
      if ((uid && !username) || (username !== currentUsername)) {

        // navigate to proper url
        this.router.navigate(['/user', uid, currentUsername]);
        return { posts, count };
      }
    }

    // fetch posts
    ({ count, posts, error } = await this.read.getPosts({ tag, uid }));

    if (error) {
      console.error(error);
    }
    return { posts, count };
  }
}
