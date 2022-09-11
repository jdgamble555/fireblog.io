import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { PostDbService } from '@db/post/post-db.service';
import { NavService } from '@nav/nav.service';
import { StateService } from '@shared/state/state.service';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostResolver implements Resolve<Post | null> {

  constructor(
    private ps: PostDbService,
    private router: Router,
    private ns: NavService,
    private state: StateService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Promise<Post | null> {
    return this.load(route);
  }

  async load(route: ActivatedRouteSnapshot): Promise<Post | null> {
    const slug = route.paramMap.get('slug');
    const id = route.paramMap.get('id');

    // get Post
    if (id) {

      // load server state
      if (this.state.hasState<Post>('post')) {
        return this.state.getState<Post>('post');
      } else {

        // get data
        const { data, error } = await this.ps.getPostById(id);
        if (error) {
          console.error(error);
        }
        if (data) {

          // handle bad slugs due to renamed posts
          if (data.slug !== slug) {
            this.router.navigate(['/post', id, data.slug]);
            return null;
          }

          // save server state
          if (this.ns.isServer) {
            this.state.saveState<Post>('post', data);
          }
          return data;
        }
      }
    }
    // bad id or no id
    this.router.navigate(['/']);
    return null;
  }
}
