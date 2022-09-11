import { Component, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { UserRec } from '@auth/user.model';
import { UserDbService } from '@db/user/user-db.service';
import { PostListService } from '@post/post-list/post-list.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  @ViewChild("tabIndex", { static: false }) tabIndex!: MatTabGroup;

  user$: Observable<UserRec | null>;

  constructor(
    public us: UserDbService,
    private pls: PostListService
  ) {

    this.pls.type = 'bookmarks';

    // see if logged in
    this.user$ = this.us.userRec;
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
