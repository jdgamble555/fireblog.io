import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { UserDbService } from '@db/user/user-db.service';
import { StateService } from '@shared/state/state.service';

@Injectable({
  providedIn: 'root'
})
export class UserPostGuard implements CanActivate {
  // must be an admin
  constructor(
    private us: UserDbService,
    private router: Router,
    private state: StateService
  ) { }
  async canActivate(next: ActivatedRouteSnapshot): Promise<boolean> {

    // preloads post component from routes only
    const uid = next.paramMap.get('uid') || undefined;
    const username = next.paramMap.get('username') || undefined;
    let isValidUsername = false;

    if (uid) {
      // username checks
      const un = this.us.getUsernameFromId(uid);
      const { username: currentUsername, error } = await this.state.loadState('user', un);
      if (error) {
        console.error(error);
      }
      // if no username in db
      if (!currentUsername) {

        // invalid id, go home
        this.router.navigate(['/']);

        // if no username in route, or invalid username
      } else if ((uid && !username) || (username !== currentUsername)) {

        // navigate to proper url
        this.router.navigate(['/u', uid, currentUsername]);

        // otherwise valid username url
      } else {
        isValidUsername = true;
      }
    }
    return isValidUsername;
  }
}
