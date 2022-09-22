import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';
import { UserDbService } from '@db/user/user-db.service';
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
    const { error, data: user } = await this.us.getUser();
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
    private us: UserDbService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {
    const { error, data: user } = await this.us.getUser();
    if (error) {
      console.error(error);
    }
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
    private us: UserDbService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {
    const { error, data: user } = await this.us.getUser();
    if (error) {
      console.error(error);
    }
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
export class NotUsernameGuard implements CanActivate {
  constructor(
    private us: UserDbService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {

    // only allow if logged in and no username
    const { error, data } = await this.us.getUser();
    if (error) {
      console.error(error);
    }
    if (data && data.uid) {
      if (!data.username) {
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
export class UsernameEmailVerifiedGuard implements CanActivate {
  // must be logged in, email verified, and has username
  constructor(
    private us: UserDbService,
    private router: Router
  ) { }
  async canActivate(): Promise<boolean> {
    const { error, data } = await this.us.getUser();
    if (error) {
      console.error(error);
    }
    if (data) {
      if (!data.emailVerified) {
        this.router.navigate(['/verify']);
      } else if (!data.username) {
        this.router.navigate(['/username']);
      } else {
        return true;
      }
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}
