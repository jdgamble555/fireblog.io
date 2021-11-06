import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { Role, User } from '../auth/user.model';
import { NavService } from '../nav/nav.service';
import { AuthService } from '../platform/mock/auth.service';
import { DbService } from '../platform/mock/db.service';
import { ReadService } from '../platform/mock/read.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  displayName!: string;

  tabName = 'posts';

  pCount: number | undefined = 0;
  dCount: number | undefined = 0;
  bCount: number | undefined = 0;

  user!: User | null;

  constructor(
    public read: ReadService,
    private db: DbService,
    private auth: AuthService,
    private router: Router,
    private ns: NavService,
    private zone: NgZone
  ) {
    // see if logged in
    this.auth.getUser()
      .then((user) => {
        if (user) {
          // see if user is in db
          this.read.getUser(user?.uid).pipe(take(1)).toPromise()
            .then((userDoc: User) => {
              if (userDoc) {
                if (userDoc.username) {
                  // update count views
                  this.user = userDoc;
                  this.pCount = userDoc.postsCount;
                  this.bCount = userDoc.bookmarksCount;
                  this.dCount = userDoc.draftsCount;
                  if (user.displayName) {
                    this.displayName = user.displayName;
                  }
                } else {
                  this.router.navigate(['/username']);
                }
              } else {
                // add user to db
                console.log(user)
                try {
                  this.db.createUser({
                    displayName: user.displayName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    photoURL: user.photoURL,
                    role: Role.Author
                  }, user.uid);
                } catch (e: any) {
                  console.error(e);
                }
              }
            });
        } else {
          this.router.navigate(['/login']);
        }
      });
    this.ns.closeLeftNav();
    this.ns.addTitle('Dashboard');
  }

  tabChange(index: number) {
    if (index === 1) {
      this.tabName = 'drafts';
    } else if (index === 2) {
      this.tabName = 'bookmarks';
    } else {
      this.tabName = 'posts';
    }
  }
}
