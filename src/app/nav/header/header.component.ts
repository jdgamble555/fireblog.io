import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserRec } from 'src/app/auth/user.model';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { ReadService } from 'src/app/platform/firebase/read.service';
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

  isActiveSearch = false;
  terms!: Observable<Post[] | null>;
  user$: Observable<UserRec | null>;

  constructor(
    private auth: AuthService,
    public ns: NavService,
    private read: ReadService
  ) {
    this.user$ = this.read.userRec;
    
  }

  toggle() {
    this.ns.toggleTheme();
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
