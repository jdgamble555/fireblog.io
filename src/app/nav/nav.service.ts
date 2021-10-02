import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

interface Link {
  name: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavService {

  title = 'Fireblog.io';

  private leftNav!: MatSidenav;
  private rightNav!: MatSidenav;

  isBrowser: Boolean;

  directories: Link[];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.directories = [];
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
}
