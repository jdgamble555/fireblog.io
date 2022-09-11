import { Component, Inject, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { environment } from '@env/environment';
import { UserRec } from '@auth/user.model';
import { Post, PostInput, PostType } from '@post/post.model';
import { SeoService } from '@shared/seo/seo.service';
import { NavService } from '@nav/nav.service';
import { PostListService } from './post-list.service';
import { PostDbService } from '@db/post/post-db.service';
import { UserDbService } from '@db/user/user-db.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnDestroy {

  user$: Observable<UserRec | null> = of(null);
  posts!: Post[] | null;
  total!: string | null;
  input: PostInput = {};
  env: any;
  private routeSub!: Subscription;

  constructor(
    public ps: PostDbService,
    private us: UserDbService,
    private route: ActivatedRoute,
    private router: Router,
    public ns: NavService,
    private seo: SeoService,
    private pls: PostListService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.env = environment;

    // don't load on server or will loop
    if (this.ns.isBrowser) {
      this.user$ = this.us.userRec;
    }

    this.routeSub = this.route.data
      .subscribe(async (p) => this.loadPage(p));
  }

  async loadPage(p: any): Promise<void> {

    this.ns.openLeftNav();
    this.ns.resetBC();

    let count: string | null = p.posts?.count;
    let posts: Post[] | null = p.posts?.posts;
    let bookmarks: boolean = p.bookmarks;

    // dynamic routes not ssr
    const tag = this.route.snapshot.params['tag'];
    const authorId = this.route.snapshot.params['uid'];
    const username = this.route.snapshot.params['username'];

    // set dynamic types
    const type: PostType = bookmarks
      ? 'bookmarks'
      : tag
        ? 'tag'
        : authorId
          ? 'user'
          : this.pls.type;

    // handle resolver router or new tab clicks
    if (!type || type === 'new') {
      this.total = count;
      this.posts = posts;
      return;
    }

    // handle input types
    switch (type) {
      case 'bookmarks':
        this.input.field = 'bookmarks';
        break;
      case 'tag':
        this.input.tag = tag;
        break;
      case 'user':
        this.input.authorId = authorId;
        break;
      case 'liked':
        this.input.sortField = 'heartsCount';
        break;
      case 'updated':
        this.input.sortField = 'updatedAt';
        break;
      case 'drafts':
        this.input.drafts = true;
        break;
    }

    // grab posts
    ({ count, posts } = await this.ps.getPosts(this.input));

    this.meta(type, username);

    if (count && posts) {
      this.total = count;
      this.posts = posts;
    }
  }

  async pageChange(event: PageEvent): Promise<void> {

    // pages
    const paging = {
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    };

    const { posts, count, error } = await this.ps.getPosts({
      ...this.input,
      ...paging
    });

    if (error) {
      console.error(error);
    }

    this.total = count;
    this.posts = posts;

    // scroll to top
    this.doc.defaultView?.scrollTo(0, 0);
  }

  meta(type: PostType, username?: string) {

    const posts = this.posts;
    const url = this.router.url;

    // meta data
    switch (type) {
      case 'bookmarks':
        url === '/bookmarks'
          ? this.ns.addTitle('Bookmarks')
          : (
            this.ns.addTitle('Dashboard'),
            this.ns.addBC('Bookmarks')
          );
        break;
      case 'tag':
        const tag = this.input.tag;
        const uTag = tag!.charAt(0).toUpperCase() + tag!.slice(1);
        this.ns.setBC(uTag);
        this.seo.generateTags({
          title: uTag + ' - ' + this.env.title
        });
        break;
      case 'user':
        url === '/dashboard'
          ? (
            this.ns.addTitle('Dashboard'),
            this.ns.addBC('Posts')
          ) : (
            username && this.ns.addTitle(username)
          );
        break;
      case 'liked':
        break;
      case 'updated':
        break;
      case 'drafts':
        this.ns.addTitle('Dashboard');
        this.ns.addBC('Drafts');
        break;
      default:
        this.seo.generateTags({ title: this.env.title });
        this.ns.resetBC();
        break;
    }

    if (posts && posts.length > 0) {
      this.seo.setSummarySchema(posts);
    }
  }

  ngOnDestroy(): void {
    // don't use template async for change detection after login
    if (this.routeSub) this.routeSub.unsubscribe();
  }
}
