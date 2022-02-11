import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { SeoService } from '../shared/seo/seo.service';

interface Link {
  name: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavService {

  title = 'Fireblog.io';
  site = "https://fireblog.io";
  storage = 'fireblog';

  author = 'Jonathan Gamble';

  isDarkMode = false;
  bgcolor = '';

  private leftNav!: MatSidenav;
  private rightNav!: MatSidenav;

  isBrowser: Boolean;
  isServer: Boolean;
  doc: Document;

  directories: Link[];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private overlay: OverlayContainer,
    private seo: SeoService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isServer = !isPlatformBrowser(platformId);
    this.doc = this.document;
    this.directories = [];

    if (this.isBrowser && this.doc.defaultView?.localStorage.getItem(this.storage + '-dark-mode')) {
      this.toggleTheme();
    }
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

  setLeftNav(leftNav: MatSidenav): void {
    this.leftNav = leftNav;
  }
  setRightNav(rightNav: MatSidenav): void {
    this.rightNav = rightNav;
  }
  openLeftNav(): void {
    this.leftNav.open();
  }
  closeLeftNav(): void {
    this.leftNav.close();
  }
  toggleLeftNav(): void {
    this.leftNav.toggle();
  }
  openRightNav(): void {
    this.rightNav.open();
  }
  closeRightNav(): void {
    this.rightNav.close();
  }
  toggleRightNav(): void {
    this.rightNav.toggle();
  }
  home(): void {
    this.router.navigate(['/']);
  }

  toggleTheme() {

    const darkClass = 'dark-theme';

    if (this.isDarkMode) {
      this.overlay.getContainerElement().classList.remove(darkClass);
      this.document.body.classList.remove(darkClass);
      if (this.isBrowser) {
        this.doc.defaultView?.localStorage.removeItem(this.storage + '-dark-mode');
      }
    } else {
      this.overlay.getContainerElement().classList.add(darkClass);
      this.document.body.classList.add(darkClass);
      if (this.isBrowser) {
        this.doc.defaultView?.localStorage.setItem(this.storage + '-dark-mode', 'true');
      }
    }
    this.isDarkMode = !this.isDarkMode;
    this.bgcolor = this.isDarkMode ? '#303030' : '';
  }
}
