import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { environment } from '@env/environment';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { UserRec } from '../auth/user.model';
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

  paramSub!: Subscription;
  postSub!: Subscription;
  userSub!: Subscription;
  //post!: Observable<Post> | Promise<Post>;
  post!: Post;
  user$!: UserRec | null;
  postId!: string;
  slug!: string;

  env: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public read: ReadService,
    private seo: SeoService,
    public ns: NavService
  ) {
    this.env = environment;
    let paramMap = this.route.paramMap;
    if (this.ns.isServer) {
      paramMap = paramMap.pipe(take(1));
    }
    this.paramSub = paramMap.subscribe(async (r: ParamMap) => await this.loadPage(r));
  }

  async loadPage(p: ParamMap) {
    const slug = this.slug = p.get('slug') as string;
    const id = this.postId = p.get('id') as string;

    // backwards compatible for 'blog'
    if (slug && !id) {
      this.read.getPostBySlug(slug).pipe(
        take(1),
        tap((r: Post) => {
          if (r) {
            this.router.navigate(['/post', r.id, r.slug]);
          }
        })
      );
    }

    const post = this.read.getPostById(id).pipe(
      tap((p: Post) => {
        // if post from id
        if (p) {
          this.meta(p);
          // check slug
          if (p.slug !== this.slug) {
            this.router.navigate(['/post', this.postId, p.slug]);
          }
        } else {
          this.router.navigate(['/home']);
        }
      }));

    // ssr render
    this.post = await this.ns.load('post', post);

    // browser version subscription
    if (this.ns.isBrowser) {

      this.userSub = this.read.userRec
        .subscribe((user: UserRec | null) => {
          if (this.postSub) {
            this.postSub.unsubscribe();
          }
          const post = user
            ? this.read.getPostById(id, user)
            : this.read.getPostById(id);

          this.postSub = post
            .subscribe((p: Post) => this.post = p);
        });
    }
  }

  meta(r: Post) {

    // add bread crumbs
    this.ns.setBC(r.title as string);
    // generate seo tags
    this.seo.generateTags({
      title: r.title + ' - ' + this.env.title,
      domain: this.env.title,
      image: r.image || undefined,
      description: r.content?.substring(0, 125).replace(/(\r\n|\n|\r)/gm, ""),
      user: environment.author
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
    if (this.paramSub) this.paramSub.unsubscribe();
    if (this.postSub) this.postSub.unsubscribe();
  }
}
