import { Component } from '@angular/core';
import { environment } from '@env/environment';
import { NavService } from '@nav/nav.service';
import { DarkModeService } from '@shared/dark-mode/dark-mode.service';
import { SeoService } from '@shared/seo/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  tabName = 'new';

  env: any;

  constructor(
    public ns: NavService,
    private seo: SeoService,
    public dm: DarkModeService
  ) {

    this.env = environment;

    this.ns.openLeftNav();

    this.seo.generateTags({
      title: this.env.title,
      description: this.env.description,
      domain: this.env.domain,
      user: this.env.author
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


