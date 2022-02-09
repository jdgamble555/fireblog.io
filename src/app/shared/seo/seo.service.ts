import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  private cachetitle = '!';

  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router
  ) { }

  generateTags({
    title = '',
    description = '',
    image = '',
    domain = '',
    user = '',
    imageW = '',
    imageH = '',
    locale = ''
  }): void {
    // do nothing if same page
    if (title === this.cachetitle) {
      return;
    }
    this.cachetitle = title;
    this.title.setTitle(title);
    this.setTags([
      // Open Graph
      { name: 'og:url', content: 'https://' + domain + this.router.url },
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:image', content: image },
      { name: 'og:type', content: 'article' },
      // Twitter Card - must use 'summary_large_image' here
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:creator', content: user },
      { name: 'twitter:site', content: '@' + domain },
      { name: 'twitter:image:alt', content: title },
      { name: 'twitter:image', content: image },
      { name: 'twitter:description', content: description }
    ]);

    if (imageW) {
      this.setTags([{ name: 'og:image:width', content: imageW }]);
    }
    if (imageH) {
      this.setTags([{ name: 'og:image:height', content: imageH }]);
    }
    if (locale) {
      this.setTags([{ name: 'og:locale', content: locale }]);
    }
  }
  private setTags(tags: any): void {
    tags.forEach((tag: any) => {
      const k = tag[Object.keys(tag)[0]];
      const t = `name='${k}'`;
      if (this.meta.getTag(t)) {
        this.meta.updateTag(tag, t);
      } else {
        this.meta.addTag(tag);
      }
    });
  }
}
