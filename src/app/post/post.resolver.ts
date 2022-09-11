import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { PostDbService } from '@db/post/post-db.service';
import { StateService } from '@shared/state/state.service';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostResolver implements Resolve<Post | null> {

  constructor(
    private ps: PostDbService,
    private state: StateService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Promise<Post | null> {
    return this.state.loadState('post', this.loadPost(route));
  }

  async loadPost(route: ActivatedRouteSnapshot): Promise<Post | null> {

    const id = route.paramMap.get('id');

    if (id) {

      // get post data
      const { data, error } = await this.ps.getPostById(id);
      if (error) {
        console.error(error);
      }
      return data;
    }
    return null;
  }
}
