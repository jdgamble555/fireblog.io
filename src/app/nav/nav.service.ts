import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavService {

  isMobile!: Boolean;
  isBrowser!: Boolean;

  private leftNav!: MatSidenav;
  private rightNav!: MatSidenav;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    const window = this.document.defaultView;

    this.isBrowser = isPlatformBrowser(platformId);

    this.isMobile = false;

    if (this.isBrowser) {
      // see if is mobile device
      window?.matchMedia("(min-width: 600px)")
        .addEventListener("change", (mq: MediaQueryListEvent) => {
          this.isMobile = !mq.matches;
        });
    }
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
