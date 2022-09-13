import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { Post } from '@post/post.model';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  private cachetitle = '!';

  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router,
    @Inject(DOCUMENT) private doc: Document
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
      { name: 'twitter:description', content: description },

      // regular meta description
      { name: 'description', content: description }
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

  setBlogSchema({
    title = '',
    author = '',
    description = '',
    image = '',
    keywords = '',
    createdAt = '',
    updatedAt = '',
    time = '',
    id = '',
    url = '',
    authorURL = '',
    username = '',
    authorId = ''
  }): void {

    const s = {
      "@context": "https://schema.org/",
      "@type": "BlogPosting",
      "headline": title,
      "author": {
        "@type": "Person",
        "name": author,
        "url": authorURL,
        "alternateName": username,
        "identifier": authorId
      },
      "datePublished": createdAt,
      "dateModified": !!updatedAt ? updatedAt : createdAt,
      "description": description,
      "image": image,
      "keywords": keywords,
      "timeRequired": time + 'M',
      "identifier": id,
      "url": url
    };

    this.generateSchema(s);
  }

  setSummarySchema(posts: Post[]): void {

    // generate summary schema
    const urls: string[] = [];
    for (const x of posts) {
      urls.push(`${environment.site}/post/${x.id}/${x.slug}`);
    }

    const list = [];

    for (let [i, url] of urls.entries()) {
      list.push({
        "@type": "ListItem",
        "position": i + 1,
        "url": url
      });
    }

    const s = {
      "@context": "https://schema.org/",
      "@type": "ItemList",
      "itemListElement": list
    };

    this.generateSchema(s);
  }

  generateSchema(s: any) {

    // Generate or Update existing json-ld script tag
    const type = 'application/ld+json';
    const script = this.doc.querySelector(`script[type="${type}"]`) as HTMLScriptElement;
    if (script) {
      script.innerHTML = JSON.stringify(s);
    } else {
      const element = this.doc.createElement('script') as HTMLScriptElement;
      element.type = type;
      element.innerHTML = JSON.stringify(s);
      const head = this.doc.getElementsByTagName('head')[0];
      head.appendChild(element);
    }
  }

}
