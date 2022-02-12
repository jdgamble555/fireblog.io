import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { firstValueFrom, isObservable, map, Observable, of, take, tap } from 'rxjs';
import { SeoService } from '../shared/seo/seo.service';


declare const Zone: any;
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
    private transferState: TransferState,
    private router: Router,
    private overlay: OverlayContainer,
    private seo: SeoService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isServer = isPlatformServer(platformId);
    this.doc = this.document;
    this.directories = [];

    if (this.isBrowser && this.doc.defaultView?.localStorage.getItem(this.storage + '-dark-mode')) {
      this.toggleTheme();
    }
  }

  saveState<T>(key: string, data: any): void {
    this.transferState.set<T>(makeStateKey(key), data);
  }

  getState<T>(key: string, defaultValue: any = []): T {
    const state = this.transferState.get<T>(makeStateKey(key), defaultValue);
    this.transferState.remove(makeStateKey(key));
    return state;
  }

  load<T>(key: string, obs: Observable<T>): Promise<T> {
    return this.isServer
      ? this.waitFor(obs.pipe(take(1), tap((data: T) => this.saveState(key, data))))
      : Promise.resolve(this.getState(key));
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

  async waitFor<T>(prom: Promise<T> | Observable<T>): Promise<T> {
    if (isObservable(prom)) {
      prom = firstValueFrom(prom);
    }
    const macroTask = Zone.current
      .scheduleMacroTask(
        `WAITFOR-${Math.random()}`,
        () => { },
        {},
        () => { }
      );
    return prom.then((p: T) => {
      macroTask.invoke();
      return p;
    });
  }
}
