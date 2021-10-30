import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../auth/user.model';
import { NavService } from '../nav/nav.service';
import { AuthService } from '../platform/mock/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  displayName!: string;

  constructor(
    public auth: AuthService,
    private router: Router,
    private ns: NavService
  ) {
    this.auth.getUser().then((user: User | null) => {
      if (user) {
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

  ngOnInit(): void {
  }

}
