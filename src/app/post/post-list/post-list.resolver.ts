import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { NavService } from '@nav/nav.service';
import { Post } from '@post/post.model';
import { StateService } from '@shared/state/state.service';
import { PostListService } from './post-list.service';

@Injectable({
  providedIn: 'root'
})
export class PostListResolver implements Resolve<{ posts: Post[] | null, count: string | null }> {

  constructor(
    private pls: PostListService,
    private state: StateService,
    private ns: NavService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Promise<{ posts: Post[] | null, count: string | null }> {
    return this.load(route);
  }

  async load(route: ActivatedRouteSnapshot) {

    this.pls.type = null;

    const hasPostsState = this.state.hasState<Post[]>('posts');
    const hasCountState = this.state.hasState<string>('count');

    let posts, count = null;

    // load server state if exists
    if (this.ns.isBrowser && hasPostsState && hasCountState) {
      posts = this.state.getState<Post[]>('posts');
      count = this.state.getState<string>('count');

    } else {

      // preloads post component from routes only
      const username = route.paramMap.get('username') || undefined;
      const uid = route.paramMap.get('uid') || undefined;
      const tag = route.paramMap.get('tag') || undefined;

      // fetch data
      ({ count, posts } = await this.pls.getPosts({ uid, tag, username }));

      // save state
      if (this.ns.isServer) {
        this.state.saveState('count', count);
        this.state.saveState('posts', posts);
      }
    }
    return { posts, count };
  }
}
