import { Component, OnInit } from '@angular/core';
import { NavService } from '../nav/nav.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    public ns: NavService
  ) { }

  ngOnInit() {
    this.ns.openLeftNav();
    this.ns.resetBC();
  }

}
