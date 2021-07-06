import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavService } from './nav.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements AfterViewInit {

  title = 'Fireblog.io';

  @ViewChild('leftNav', { static: true }) leftNav!: MatSidenav;
  @ViewChild('rightNav', { static: true }) rightNav!: MatSidenav;

  constructor(
    public nav: NavService
  ) { }

  ngAfterViewInit(): void {
    this.nav.setLeftNav(this.leftNav);
    this.nav.setRightNav(this.rightNav);
  }

}
