import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ReadService } from '@db/read.service';
import { NavService } from '@nav/nav.service';
import { StateService } from '@shared/state/state.service';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private read: ReadService,
    private router: Router,
    private ns: NavService,
    private state: StateService
  ) { }

  async getPostBySlug(slug: string): Promise<null> {

    // old blog url, so redirect correctly with id
    const { error, data } = await this.read.getPostBySlug(slug);
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
      const { data, error } = await this.read.getPostById(id);
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
