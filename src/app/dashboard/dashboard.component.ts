import { Component, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { UserRec } from '@auth/user.model';
import { UserDbService } from '@db/user/user-db.service';
import { NavService } from '@nav/nav.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  user$: Observable<UserRec | null>;

  constructor(
    public us: UserDbService,
    public ns: NavService
  ) {

    this.ns.type = 'bookmarks';

    // see if logged in
    this.user$ = this.us.user$;
  }

  tabChange(index: number) {
    if (index === 0) {
      this.ns.type = 'bookmarks';
    } else if (index === 1) {
      this.ns.type = 'user';
    } else {
      this.ns.type = 'drafts';
    }
  }
}
