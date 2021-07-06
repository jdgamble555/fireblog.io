import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BreadCrumbsService {

  crumbs!: any;

  constructor(private router: Router) { }

  getFriendlyURL(url: string): string {
    // create friendly URL
    return url
      .trim()
      .toLowerCase()
      .replace(/^[^a-z\d]*|[^a-z\d]*$/gi, '') // trim other characters as well
      .replace(/-/g, ' ')
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  getDirectories(root = 'directory/category'): void {

    let r = this.router.url;

    r = r.replace(root, 'directory');

    let i = 1;

    const a = r.split('/').filter((c: string) => {
      // filter blanks
      if (c) { return c; }
      return null;
    }).map((c: any) => {
      if (i !== 1) {
        root += '/' + c;
      }
      let name = c.charAt(0).toUpperCase() + c.substring(1);
      name = name.replace(/-/g, ' ');
      name = this.toTitleCase(name);
      ++i;
      return {
        name,
        link: '/' + root,
        position: i
      };
    });
    this.crumbs = a;
  }
  toTitleCase(str: string): string {
    str = str.replace(/([^\W_]+[^\s-]*) */g, (txt: string) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless
    // they are the first or last words in the string
    const lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
      'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
    for (let i = 0, j = lowers.length; i < j; i++) {
      str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
        (txt: string) => {
          return txt.toLowerCase();
        });
    }
    // Certain words such as initialisms or acronyms should be left uppercase
    const uppers = ['Id', 'Tv'];
    for (let i = 0, j = uppers.length; i < j; i++) {
      str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
        uppers[i].toUpperCase());
    }
    return str;
  }
}
