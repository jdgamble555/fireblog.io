import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';

import { take } from 'rxjs/operators';
import { AuthService } from '../platform/mock/auth.service';
import { ReadService } from '../platform/mock/read.service';
import { Role } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private read: ReadService, private router: Router) { }
  async canActivate(): Promise<boolean> {
    const user = await this.read.userDoc.pipe(take(1)).toPromise();
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
  constructor(private auth: AuthService, private router: Router) { }
  async canActivate(): Promise<boolean> {
    const user = await this.auth.user$.pipe(take(1)).toPromise();
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
  constructor(private auth: AuthService, private router: Router) { }
  async canActivate(): Promise<boolean> {
    const user = await this.auth.user$.pipe(take(1)).toPromise();
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
  constructor(private auth: AuthService, private router: Router) { }
  async canActivate(): Promise<boolean> {
    // make sure logged in first...
    const user = await this.auth.user$.pipe(take(1)).toPromise();
    const emailVerified = !!(user && user?.emailVerified);
    if (!emailVerified) {
      this.router.navigate(['/verify']);
    }
    return emailVerified;
  }
}

