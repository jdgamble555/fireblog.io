import { Component } from '@angular/core';
import { environment } from '@env/environment';
import { NavService } from '@nav/nav.service';
import { PostListService } from '@post/post-list/post-list.service';
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
    public dm: DarkModeService,
    private pls: PostListService
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
      this.pls.type = 'updated';
      this.tabName = 'updated';
    } else if (index === 2) {
      this.pls.type = 'liked';
      this.tabName = 'liked';
    } else {
      this.pls.type = 'new';
      this.tabName = 'new';
    }
  }
}


