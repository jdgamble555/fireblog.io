import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@db/auth/auth.service';
import { UserDbService } from '@db/user/user-db.service';

@Injectable({
  providedIn: 'root'
})
export class UsernameGuard implements CanActivate {
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
      const { username, error } = await this.us.getUsernameFromId(uid);
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
