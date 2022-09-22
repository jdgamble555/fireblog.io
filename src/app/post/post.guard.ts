import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PostDbService } from '@db/post/post-db.service';
import { StateService } from '@shared/state/state.service';

@Injectable({
  providedIn: 'root'
})
export class PostGuard implements CanActivate {

  constructor(
    private ps: PostDbService,
    private router: Router,
    private state: StateService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot): Promise<boolean> {

    let slug = next.paramMap.get('slug');
    const id = next.paramMap.get('id');
    let error = null;
    let data = null;

    if (id) {

      ({ data, error } = await this.state.loadState('post', this.ps.getPostById(id)));
      if (error) {
        console.error(error);
      }

      // handle bad slugs due to renamed posts
      if (slug && data && (data.slug === slug)) {

        // use guard as a resolver to pass data to component
        next.data = { ...next.data, post: data };
        return true;
      }

      // get correct slug
      if (data && data.slug) {
        slug = data.slug;
      }

    } else if (slug && !id) {

      // old blog url, so redirect correctly with id
      ({ error, data } = await this.ps.getPostBySlug(slug));
      if (error) {
        console.error(error);
      }
    }

    // redirect to correct location, or go home
    data
      ? this.router.navigate(['/post', data.id, slug])
      : this.router.navigate(['/']);

    return false;
  }
}
