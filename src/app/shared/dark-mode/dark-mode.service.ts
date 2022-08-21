import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { NavService } from '@nav/nav.service';


@Injectable({
  providedIn: 'root'
})
export class DarkModeService {

  isDarkMode = false;
  bgcolor = '';

  storage: string;

  darkClass = 'dark-theme';

  constructor(private overlay: OverlayContainer, private ns: NavService) {
    this.storage = environment.storage;
  }

  setTheme() {
    const _class = this.storage + this.darkClass;
    if (this.ns.isBrowser && this.ns.doc.defaultView?.localStorage.getItem(_class)) {
      this.toggleTheme();
    }
  }

  toggleTheme() {

    const _class = this.storage + this.darkClass;
    if (this.isDarkMode) {
      this.overlay.getContainerElement().classList.remove(this.darkClass);
      this.ns.doc.body.classList.remove(this.darkClass);
      if (this.ns.isBrowser) {
        this.ns.doc.defaultView?.localStorage.removeItem(_class);
      }
    } else {
      this.overlay.getContainerElement().classList.add(this.darkClass);
      this.ns.doc.body.classList.add(this.darkClass);
      if (this.ns.isBrowser) {
        this.ns.doc.defaultView?.localStorage.setItem(_class, 'true');
      }
    }
    this.isDarkMode = !this.isDarkMode;
    this.bgcolor = this.isDarkMode ? '#303030' : '';
  }
}
