import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Post } from './post.model';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root'
})
export class PostResolver implements Resolve<Post | null> {

  constructor(private ps: PostService) { }
  
  resolve(route: ActivatedRouteSnapshot): Promise<Post | null> {

    const slug = route.paramMap.get('slug');
    const id = route.paramMap.get('id');

    // backwards compatible blog redirect
    if (slug && !id) {
      return this.ps.getPostBySlug(slug);
    }

    // get Post
    if (id) {
      return this.ps.getPostById(id, slug);
    }

    return Promise.resolve(null);
  }
}
