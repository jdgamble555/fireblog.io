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

    const slug = route.paramMap.get('slug');
    const id = route.paramMap.get('id');

    // backwards compatible blog redirect
    if (slug && !id) {
      return this.getPostBySlug(slug);
    }

    // get Post
    if (id) {
      return this.getPostById(id, slug);
    }

    return Promise.resolve(null);
  }

  async getPostBySlug(slug: string): Promise<null> {

    // old blog url, so redirect correctly with id
    const { error, data } = await this.ps.getPostBySlug(slug);
    if (error) {
      console.error(error);
    }

    // redirect to correct location, or go home
    data
      ? this.router.navigate(['/post', data.id, data, slug])
      : this.router.navigate(['/']);
    return null;
  }

  async getPostById(id: string, slug: string | null): Promise<Post | null> {

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
        }

        // save server state
        if (this.ns.isServer) {
          this.state.saveState<Post>('post', data);
        }
        return data;

      } else {

        // bad id
        this.router.navigate(['/']);
      }
    }
    return null;
  }
}
