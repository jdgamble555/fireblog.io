import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PostDbService } from '@db/post/post-db.service';

@Injectable({
  providedIn: 'root'
})
export class PostGuard implements CanActivate {

  constructor(
    private ps: PostDbService,
    private router: Router
  ) { }

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {

    // todo - add caching to prevent extra db fetching

    let slug = route.paramMap.get('slug');
    const id = route.paramMap.get('id');
    let error = null;
    let data = null;

    if (id) {

      ({ data, error } = await this.ps.getPostById(id));
      if (error) {
        console.error(error);
      }

      // handle bad slugs due to renamed posts
      if (slug && data && (data.slug === slug)) {
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
