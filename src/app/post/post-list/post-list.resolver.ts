import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { PostDbService } from '@db/post/post-db.service';
import { NavService } from '@nav/nav.service';
import { Post, PostType } from '@post/post.model';
import { StateService } from '@shared/state/state.service';

@Injectable({
  providedIn: 'root'
})
export class PostListResolver implements Resolve<{ posts: Post[] | null, count: string | null }> {

  type: PostType;

  constructor(
    private state: StateService,
    private ns: NavService,
    private ps: PostDbService
  ) {
    this.type = null;
  }

  // todo - add return type here when doing post-db
  resolve(route: ActivatedRouteSnapshot): Promise<{ posts: Post[] | null, count: string | null }> {
    return this.load(route);
  }

  async load(route: ActivatedRouteSnapshot) {

    // preloads post component from routes only
    const uid = route.paramMap.get('uid') || undefined;
    const tag = route.paramMap.get('tag') || undefined;

    let posts = null;
    let count = null;
    let error = null;

    const hasPostsState = this.state.hasState<Post[]>('posts');
    const hasCountState = this.state.hasState<string>('count');

    // load server state if exists
    if (this.ns.isBrowser && hasPostsState && hasCountState) {
      posts = this.state.getState<Post[]>('posts');
      count = this.state.getState<string>('count');

    } else {

      // fetch data
      ({ count, posts, error } = await this.ps.getPosts({ uid, tag }));
      if (error) {
        console.error(error);
      }

      // save state
      if (this.ns.isServer) {
        this.state.saveState('count', count);
        this.state.saveState('posts', posts);
      }
    }
    return { posts, count };
  }
}
