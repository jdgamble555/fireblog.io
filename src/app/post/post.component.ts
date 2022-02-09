import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserRec } from '../auth/user.model';
import { CoreModule } from '../core/core.module';
import { NavService } from '../nav/nav.service';
import { ReadService } from '../platform/firebase/read.service';
import { SeoService } from '../shared/seo/seo.service';
import { Post } from './post.model';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnDestroy {

  post!: Observable<Post> | Promise<Post>;
  user$!: UserRec | null;
  sub!: Subscription;
  postId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public read: ReadService,
    private seo: SeoService,
    private core: CoreModule,
    public ns: NavService,
  ) {
    this.ns.openLeftNav();
    this.sub = this.route.paramMap.subscribe(async (r: ParamMap) => await this.loadPage(r));
  }

  async loadPage(p: ParamMap) {
    const slug = p.get('slug');
    const id = p.get('id');

    // backwards compatible for 'blog', will be removed later
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
      this.postId = id;
      let post: Post;

      // browser version
      if (this.ns.isBrowser) {
        this.post = this.read.getPostById(id).pipe(
          switchMap((r: Post) => {

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
            post = r;
            return this.read.userRec;
          }),
          switchMap((user: UserRec | null) => {
            // get user and heart
            if (user && user.uid) {
              this.user$ = user;
              return combineLatest([
                this.read.getAction(id, user.uid, 'hearts'),
                this.read.getAction(id, user.uid, 'bookmarks')
              ]);
            }
            return of(null);
          }),
          map((p: [boolean, boolean] | null) => {
            if (p) {
              // save liked and saved
              [post.liked, post.saved] = p;
            }
            return post;
          })
        );
      } else {

        // ssr render
        this.post = this.core.waitFor(
          this.read.getPostById(id)
        ).then((p: Post) => {
          this.meta(p);
          return p;
        });
      }
    }
  }

  meta(r: Post) {

    // add bread crumbs
    this.ns.setBC(r.title as string);
    // generate seo tags
    this.seo.generateTags({
      title: r.title + ' - ' + this.ns.title,
      domain: this.ns.title,
      image: r.image || undefined,
      description: r.content?.substring(0, 125).replace(/(\r\n|\n|\r)/gm, ""),
      user: this.ns.author
    });
  }

  toggleAction(action: string, toggle?: boolean) {

    // toggle save and like
    if (this.user$ && this.user$.uid && toggle !== undefined) {
      toggle
        ? this.read.unActionPost(this.postId, this.user$.uid, action)
        : this.read.actionPost(this.postId, this.user$.uid, action);
    } else {
      this.router.navigate(['login']);
    }
  }

  // encode for share button
  urlEncode(s?: string) {
    return encodeURIComponent(s || '');
  }

  shareURL(title?: string) {
    return this.urlEncode(this.ns.site + '/post/' + this.postId + '/' + title);
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
