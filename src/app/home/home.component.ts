import { Component, OnInit } from '@angular/core';
import { NavService } from '../nav/nav.service';
import { SeoService } from '../shared/seo/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private ns: NavService,
    private seo: SeoService
  ) { }

  ngOnInit(): void {
    this.ns.resetBC();
    this.ns.openLeftNav();
    this.seo.generateTags({ domain: this.ns.title, title: this.ns.title + ': Home' });
  }
}
