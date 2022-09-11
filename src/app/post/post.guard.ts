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

    const slug = route.paramMap.get('slug');
    let error = null;
    let data = null;

    // old blog url, so redirect correctly with id
    if (slug) {
      ({ error, data } = await this.ps.getPostBySlug(slug));
      if (error) {
        console.error(error);
      }
    }

    // redirect to correct location, or go home
    data
      ? this.router.navigate(['/post', data.id, data, slug])
      : this.router.navigate(['/']);

    return false;
  }
}
