import { Component } from '@angular/core';
import { NavService } from '../nav/nav.service';
import { SeoService } from '../shared/seo/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  tabName = 'new';

  constructor(
    public ns: NavService,
    private seo: SeoService
  ) {

    this.seo.generateTags({
      title: this.ns.title,
      description: 'A blog about Firebase and Firestore! Search, Indexing, Rules, and more!',
      domain: 'fireblog.io',
      user: 'Jonathan Gamble'
    });
  }

  tabChange(index: number) {
    if (index === 1) {
      this.tabName = 'updated';
    } else if (index === 2) {
      this.tabName = 'liked';
    } else {
      this.tabName = 'new';
    }
  }
}
