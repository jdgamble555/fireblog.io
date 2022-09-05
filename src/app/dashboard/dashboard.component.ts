import { Component, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { UserRec } from '@auth/user.model';
import { ReadService } from '@db/read.service';
import { NavService } from '@nav/nav.service';
import { PostListService } from '@post/post-list/post-list.service';
import { Observable, tap } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  @ViewChild("tabIndex", { static: false }) tabIndex!: MatTabGroup;

  user$: Observable<UserRec | null>;

  constructor(
    public read: ReadService,
    private router: Router,
    private ns: NavService,
    private pls: PostListService
  ) {

    this.pls.type = 'bookmarks';

    // see if logged in
    this.user$ = this.read.userRec
      .pipe(
        tap((userRec: UserRec | null) => {
          if (userRec) {
            // see if user is in db
            if (!userRec.username) {
              this.router.navigate(['/username']);
            }
          } else {
            this.router.navigate(['/login']);
          }
        }));
  }

  tabChange(index: number) {
    if (index === 0) {
      this.pls.type = 'bookmarks';
    } else if (index === 1) {
      this.pls.type = 'user';
    } else {
      this.pls.type = 'drafts';
    }
  }
}
