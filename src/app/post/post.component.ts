import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { User } from '../auth/user.model';
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
  postId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public read: ReadService,
    private seo: SeoService,
    public ns: NavService,
  ) {
    this.ns.openLeftNav();
    this.sub = this.route.paramMap.subscribe((r: ParamMap) => this.loadPage(r));
  }

  loadPage(p: ParamMap) {
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
      // get post by router id
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
          return this.read.userDoc;
        }),
        switchMap((user: User | null) => {
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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
