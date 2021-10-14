import { Component, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { CoreModule } from '../core/core.module';
import { NavService } from '../nav/nav.service';
import { AuthService } from '../platform/mock/auth.service';
import { ReadService } from '../platform/mock/read.service';
import { SeoService } from '../shared/seo/seo.service';
import { Post } from './post.model';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnDestroy {

  post!: Observable<Post> | Promise<Post>;
  user$!: User | null;
  sub!: Subscription;

  isHeart!: boolean;
  isBookmark!: boolean;
  postId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public read: ReadService,
    private auth: AuthService,
    private seo: SeoService,
    public ns: NavService,
    private cm: CoreModule
  ) {

    this.ns.openLeftNav();

    let params = this.route.paramMap;

    if (!this.ns.isBrowser) {
      params = params.pipe(take(1));
    }
    this.sub = params.subscribe((r: ParamMap) => this.loadPage(r));
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
      this.postId = id;
      // get post by router id
      let p = this.read.getPostById(id).pipe(
        tap(async (r: Post) => {
          // if post from id
          if (r) {
            this.meta(r);
            // check slug
            if (r.slug !== slug) {
              this.router.navigate(['/post', id, r.slug]);
            }
            // get user and heart
            if (this.ns.isBrowser) {
              this.user$ = await this.auth.getUser();
              if (this.user$) {
                this.isHeart = await this.read.getAction(id, this.user$.uid, 'hearts');
                this.isBookmark = await this.read.getAction(id, this.user$.uid, 'bookmarks');
              }
            }
          } else {
            this.router.navigate(['/home']);
          }
        })
      );
      this.post = this.ns.isBrowser ? p : this.cm.waitFor(p);
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

  toggleAction(action: string) {
    const isAction = action === 'hearts'
      ? this.isHeart
      : this.isBookmark;
    if (this.user$) {
      isAction
        ? this.read.unActionPost(this.postId, this.user$.uid, action)
        : this.read.actionPost(this.postId, this.user$.uid, action);
    } else {
      this.router.navigate(['login']);
    }
  }

  ngOnDestroy(): void {
    if (this.ns.isBrowser) {
      this.sub.unsubscribe();
    }
  }
}
