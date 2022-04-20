import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, isObservable, Observable, tap } from 'rxjs';
import { StateService } from '../core/state.service';
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

  simple = false;

  isDarkMode = false;
  bgcolor = '';

  isBrowser: Boolean;
  isServer: Boolean;
  doc: Document;

  directories: Link[];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private state: StateService,
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

  load<T>(key: string, obs: Observable<T>): Promise<T> {
    return this.isServer
      ? this.waitFor(obs.pipe(tap((data: T) => this.state.saveState(key, data))))
      : this.state.hasState(key) ? Promise.resolve(this.state.getState(key)) : firstValueFrom(obs);
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
    this.simple = false;
  }
  closeLeftNav(): void {
    this.simple = true;
  }
  toggleLeftNav(): void {

  }
  openRightNav(): void {

  }
  closeRightNav(): void {

  }
  toggleRightNav(): void {

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
