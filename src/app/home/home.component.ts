import { Component } from '@angular/core';
import { NavService } from '../nav/nav.service';
import { SeoService } from '../shared/seo/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(
    public ns: NavService,
    private seo: SeoService
  ) {

    this.seo.generateTags({
      title: this.ns.title,
      description: 'A blog about Firebase and Firestore!',
      domain: 'fireblog.io',
      user: 'Jonathan Gamble'
    });
  }

}
