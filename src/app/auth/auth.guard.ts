import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';
import { AuthService } from '@db/auth/auth.service';
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

