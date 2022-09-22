import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PostDbService } from '@db/post/post-db.service';
import { UserDbService } from '@db/user/user-db.service';
import { StateService } from '@shared/state/state.service';

@Injectable({
  providedIn: 'root'
})
export class PostListGuard implements CanActivate {
  // must be an admin
  constructor(
    private us: UserDbService,
    private router: Router,
    private state: StateService,
    private ps: PostDbService
  ) { }
  async canActivate(next: ActivatedRouteSnapshot): Promise<boolean> {

    // preloads post component from routes only
    const uid = next.paramMap.get('uid');
    const username = next.paramMap.get('username');
    const tag = next.paramMap.get('tag');

    // home
    if (!uid && !username && !tag) {

      const { data, error, count } = await this.state.loadState('posts', this.ps.getPosts());
      if (error) {
        console.error(error);
      }

      // resolve data
      next.data = { ...next.data, posts: data, count };
      return true;
    }

    // tag
    else if (tag) {

      const { data, error, count } = await this.state.loadState('posts',
        this.ps.getPosts({ tag })
      );
      if (error) {
        console.error(error);
      }
      if (data && data.length > 0) {
        next.data = { ...next.data, posts: data, count };
        return true;
      }
    }

    // user
    else if (uid) {
      const { data, error } = await this.state.loadState('user',
        this.us.getUsernameFromId(uid)
      );
      const currentUsername = data?.username;
      if (error) {
        console.error(error);
      }
      // if no username in db
      if (currentUsername && (!username || username && (username !== currentUsername))) {

        // navigate to proper url
        this.router.navigate(['/u', uid, currentUsername]);
        return false;

        // otherwise valid username url
      } else if (data) {
        const { data, error, count } = await this.state.loadState('posts',
          this.ps.getPosts({ uid })
        );
        if (error) {
          console.error(error);
        }
        if (data && data.length > 0) {
          next.data = { ...next.data, posts: data, count };
          return true;
        }
      }
    }

    // otherwise go home
    this.router.navigate(['/']);
    return false;
  }
}
