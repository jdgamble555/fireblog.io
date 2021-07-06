import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from './auth.service';
import { User } from './user.model';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
/* Role Guard */
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const user: User | null = await this.auth.user$.pipe(take(1)).toPromise();
    const isAdmin = !!(user && user.roles?.admin);
    if (!isAdmin) {
      // console.log('Access denied - Admins only');
    }
    return isAdmin;
  }
}
@Injectable({
  providedIn: 'root'
})
/* Login Guard */
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    const user = await this.auth.user$.pipe(take(1)).toPromise();
    const isLoggedIn = !!user;
    if (!isLoggedIn) {
      // console.log('You must be logged in for that.');
      this.router.navigate(['/login']);
    }
    return isLoggedIn;
  }
}
@Injectable({
  providedIn: 'root'
})
/* Logged Out Guard */
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const user = await this.auth.user$.pipe(take(1)).toPromise();
    const isLoggedOut = !(!!user);
    if (!isLoggedOut) {
      // console.log('You must not be logged in for that.');
      this.router.navigate(['/']);
    }
    return isLoggedOut;
  }
}
@Injectable({
  providedIn: 'root'
})
export class EmailGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // make sure logged in first...
    return await this.auth.user$.pipe(take(1)).toPromise().then(() => {
      const emailVerified = !!this.auth.emailVerified$;
      if (!emailVerified) {
        // console.log('You must verify your email address.');
        this.router.navigate(['/user/verify']);
      }
      return emailVerified;
    });
  }
}

