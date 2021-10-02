import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Role, User as Profile } from 'src/app/auth/user.model';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { ReadService } from 'src/app/platform/firebase/read.service';
import { NavService } from '../nav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

  @Output() menuButtonClicked = new EventEmitter();
  @Input() title!: string;

  isAdmin = false;

  isActiveSearch = false;

  terms!: Observable<any[]>;

  constructor(
    public auth: AuthService,
    public ns: NavService,
    private read: ReadService
  ) {

    if (this.ns.isBrowser) {
      this.auth.getUser().then((user: User | null) => {
        if (user) {
          this.read.getUser(user.uid).pipe(
            tap((u: Profile) => {
              if (u.role === Role.Admin) {
                this.isAdmin = true;
              }
            }),
            take(1)
          ).subscribe();
        }
      });
    }
  }

  logout() {
    this.auth.logout();
    this.ns.home();
  }

  search(event: Event) {
    const term = (<HTMLInputElement>event.target).value;
    this.terms = term ? this.read.searchPost(term) : of([]);
  }
}
