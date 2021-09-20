import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { Role, User } from 'src/app/auth/user.model';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { ReadService } from 'src/app/platform/firebase/read.service';
import { NavService } from '../nav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {

  @Output() menuButtonClicked = new EventEmitter();
  @Input() title!: string;

  isAdmin = false;

  constructor(
    public auth: AuthService,
    public ns: NavService,
    private read: ReadService
  ) { }

  async ngOnInit() {
    const user = await this.auth.getUser();
    if (user) {
      this.read.getUser(user.uid).pipe(
        tap((u: User) => {
          if (u.role === Role.Admin) {
            this.isAdmin = true;
          }
        }),
        take(1)
      ).subscribe();
    }
  }

  logout() {
    this.auth.logout();
    this.ns.home();
  }
}
