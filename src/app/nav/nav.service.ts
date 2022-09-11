import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { SeoService } from '@shared/seo/seo.service';


declare const Zone: any;
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
  isBrowser: Boolean;
  isServer: Boolean;
  doc: Document;
  directories: Link[];

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
    // todo - make this a subscribption
    this.simple = false;
  }
  closeLeftNav(): void {
    this.simple = true;
  }

  home(): void {
    this.router.navigate(['/']);
  }
}
