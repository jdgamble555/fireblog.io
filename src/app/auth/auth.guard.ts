import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router
} from '@angular/router';
import { AuthService } from '@db/auth/auth.service';
import { UserDbService } from '@db/user/user-db.service';
import { StateService } from '@shared/state/state.service';
import { Role } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  // must be an admin
  constructor(
    private us: UserDbService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {
    const { error, data: user } = await this.us.getUserRec();
    if (error) {
      console.error(error);
    }
    const isAdmin = !!(user && user.role === Role.Admin);
    if (!isAdmin) {
      this.router.navigate(['/home']);
    }
    return isAdmin;
  }
}
@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  // must be logged in
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {
    const user = await this.auth.getUser();
    const isLoggedIn = !!user;
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
    }
    return isLoggedIn;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotLoginGuard implements CanActivate {
  // cannot access if logged in
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {
    const user = await this.auth.getUser();
    const isLoggedIn = !!user;
    if (isLoggedIn) {
      this.router.navigate(['/settings']);
    }
    return !isLoggedIn;
  }
}

@Injectable({
  providedIn: 'root'
})
export class EmailGuard implements CanActivate {
  // email must be verified
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {
    // make sure logged in first...
    const user = await this.auth.getUser();
    const emailVerified = !!(user && user?.emailVerified);
    if (!emailVerified) {
      this.router.navigate(['/verify']);
    }
    return emailVerified;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotUsernameGuard implements CanActivate {
  constructor(
    private us: UserDbService,
    private auth: AuthService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {

    // only allow if logged in and no username
    const uid = (await this.auth.getUser())?.uid;

    // if logged in
    if (uid) {
      const { data: username, error } = await this.us.getUsernameFromId(uid);
      if (error) {
        console.error(error);
      }
      if (!username) {
        return true;
      }

      // username exists, go to dashboard
      this.router.navigate(['/dashboard']);
    } else {

      // login page
      this.router.navigate(['/login']);
    }
    return false;
  }
}
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
      // todo -fix!
      const fetch_un = this.us.getUsernameFromId(uid);
      const { data: currentUsername, error } = await this.state.loadState('user', fetch_un);
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

