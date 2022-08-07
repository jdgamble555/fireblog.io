import { Component, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from '@db/auth.service';
import { ReadService } from '@db/read.service';
import { environment } from '@env/environment';
import { DarkModeService } from '@shared/dark-mode/dark-mode.service';
import { Observable, of } from 'rxjs';
import { UserRec } from 'src/app/auth/user.model';
import { Post } from 'src/app/post/post.model';
import { NavService } from '../nav.service';


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
  terms!: Observable<Post[] | null>;
  user$: Observable<UserRec | null>;

  constructor(
    private auth: AuthService,
    public ns: NavService,
    public dm: DarkModeService,
    private read: ReadService
  ) {
    this.user$ = this.read.userRec;
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

  search(event: Event) {
    const term = (<HTMLInputElement>event.target).value;
    this.terms = term ? this.read.searchPost(term) : of(null);
  }
}
