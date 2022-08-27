import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';
import { AuthService } from '@db/auth.service';
import { DbService } from '@db/db.service';
import { ReadService } from '@db/read.service';
import { firstValueFrom } from 'rxjs';
import { Role } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private read: ReadService, private router: Router) { }
  async canActivate(): Promise<boolean> {
    const user = await this.read.getUser();
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
  constructor(private auth: AuthService, private router: Router) { }
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
  constructor(private auth: AuthService, private router: Router) { }
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
export class UsernameGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private db: DbService
  ) { }
  async canActivate(): Promise<boolean> {
    // make sure logged in first...
    const user = await this.auth.getUser();
    if (user) {
      const hasUsername = await firstValueFrom(this.db.hasUsername(user?.uid));
      if (!hasUsername) {
        this.router.navigate(['/username']);
      }
      return hasUsername;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
