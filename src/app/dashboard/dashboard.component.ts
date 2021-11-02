import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { User } from '../auth/user.model';
import { NavService } from '../nav/nav.service';
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
    private router: Router,
    private ns: NavService
  ) {
    this.read.userDoc.pipe(take(1)).toPromise()
      .then((user: User | null) => {
        if (user) {
          this.user = user;
          this.pCount = user.postsCount;
          this.bCount = user.bookmarksCount;
          this.dCount = user.draftsCount;
          if (user.displayName) {
            this.displayName = user.displayName;
          }
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
