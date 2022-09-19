import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { PostType } from '@post/post.model';
import { SeoService } from '@shared/seo/seo.service';


interface Link {
  name: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavService {

  simple = false;
  private title: string;
  dashboardIndex = 0;

  directories: Link[];
  type: PostType = 'new';

  isBrowser: Boolean;
  isServer: Boolean;
  doc: Document;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private seo: SeoService
  ) {
    this.title = environment.title;
    this.isBrowser = isPlatformBrowser(platformId);
    this.isServer = isPlatformServer(platformId);
    this.doc = this.document;
    this.directories = [];
  }

  // add title
  addTitle(name: string) {
    this.setBC(name);
    this.seo.generateTags({
      title: name + ' - ' + this.title
    });
  }

  // reset bread crumb
  resetBC() {
    this.directories = [];
  }

  // set bread crumb
  setBC(name: string, location?: string) {
    this.resetBC();
    this.addBC(name, location);
  }

  // add bread crumb
  addBC(name: string, location?: string) {
    if (!location) {
      location = '';
    }
    const data: Link = {
      name,
      location
    };
    this.directories.push(data);
  }

  openLeftNav(): void {
    // wait for view to render
    if (this.isBrowser) {
      setTimeout(() => {
        this.simple = false;
      }, 0);
    }
  }
  
  closeLeftNav(): void {
    // wait for view to render
    if (this.isBrowser) {
      setTimeout(() => {
        this.simple = true;
      }, 0);
    }
  }

  home(): void {
    this.router.navigate(['/']);
  }
}
