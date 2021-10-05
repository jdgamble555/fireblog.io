import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { NavService } from '../nav/nav.service';
import { AuthService } from '../platform/firebase/auth.service';
import { ReadService } from '../platform/firebase/read.service';
import { SeoService } from '../shared/seo/seo.service';
import { Post } from './post.model';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  post!: Observable<Post>;
  user$: Observable<any>;
  sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private read: ReadService,
    private auth: AuthService,
    private seo: SeoService,
    private ns: NavService
  ) {

    this.user$ = this.ns.isBrowser ? this.auth.user$ : of(null);
    this.ns.openLeftNav();

    if (this.ns.isBrowser) {
      this.sub = this.route.paramMap.subscribe((r: ParamMap) => this.loadPage(r));
    }
  }

  loadPage(p: ParamMap) {
    const slug = p.get('slug');
    const id = p.get('id');

    // backwards compatible, will be removed later
    if (slug && !id) {
      this.post = this.read.getPostBySlug(slug).pipe(
        tap((r: Post) => {
          if (r) {
            this.router.navigate(['/post', r.id, r.slug]);
          }
        })
      );
      return;
    }

    if (id) {
      // get post by router id
      this.post = this.read.getPostById(id).pipe(
        tap((r: Post) => {
          // if post from id
          if (r) {
            this.meta(r);
            // check slug
            if (r.slug !== slug) {
              this.router.navigate(['/post', id, r.slug]);
            }
          } else {
            this.router.navigate(['/home']);
          }
        })
      );
    }
  }

  meta(r: Post) {
    // add bread crumbs
    this.ns.setBC(r.title as string);
    // generate seo tags
    this.seo.generateTags({
      domain: this.ns.title,
      image: r.image || undefined,
      description: r.content?.substring(0, 125).replace(/(\r\n|\n|\r)/gm, ""),
      title: r.title + ' - ' + this.ns.title,
      user: this.ns.author
    });
  }

  async ngOnInit() {
    if (!this.ns.isBrowser) {
      // seo for ssr
      const id = (await this.route.paramMap.pipe(take(1)).toPromise()).get('id') as string;
      await this.read.getPostById(id).pipe(
        tap((p: any) => this.meta(p))
      ).toPromise();
    }
  }

  ngOnDestroy(): void {
    if (this.ns.isBrowser) {
      this.sub.unsubscribe();
    }
  }
}
