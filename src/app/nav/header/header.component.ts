import { Component, EventEmitter, Output, Input } from '@angular/core';
import { UserRec } from '@auth/user.model';
import { AuthService } from '@db/auth/auth.service';
import { PostDbService } from '@db/post/post-db.service';
import { UserDbService } from '@db/user/user-db.service';
import { environment } from '@env/environment';
import { NavService } from '@nav/nav.service';
import { Post } from '@post/post.model';
import { DarkModeService } from '@shared/dark-mode/dark-mode.service';
import { Observable, of } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

  @Output() menuButtonClicked = new EventEmitter();
  @Input() title!: string;

  env: any;

  isActiveSearch = false;
  terms!: Post[] | null;
  user$: Observable<UserRec | null> = of(null);

  constructor(
    private auth: AuthService,
    public ns: NavService,
    public dm: DarkModeService,
    private ps: PostDbService,
    private us: UserDbService
  ) {
    if (this.ns.isBrowser) {
      this.user$ = this.us.userRec;
    }
    this.dm.setTheme();
    this.env = environment;
  }

  toggle() {
    this.dm.toggleTheme();
  }

  logout() {
    this.auth.logout();
    this.ns.home();
  }

  async search(event: Event): Promise<void> {
    const term = (<HTMLInputElement>event.target).value;
    let data = null;
    let error = null;
    if (term) {
      ({ data, error } = await this.ps.searchPost(term));
      if (error) {
        console.error(error);
      }
    }
    this.terms = data ? data : null;
  }
}
