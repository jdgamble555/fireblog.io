import { Component, Inject, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { environment } from '@env/environment';
import { ReadService } from '@db/read.service';
import { UserRec } from '@auth/user.model';
import { Post } from '@post/post.model';
import { SeoService } from '@shared/seo/seo.service';
import { NavService } from '@nav/nav.service';
import { AuthService } from '@db/auth.service';
import { PostListService, PostType } from './post-list.service';

interface postInput {
  sortField?: string,
  sortDirection?: 'desc' | 'asc',
  tag?: string,
  uid?: string,
  authorId?: string,
  field?: string,
  page?: number,
  pageSize?: number,
  drafts?: boolean
};

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnDestroy {

  user$: Observable<UserRec | null> = of(null);
  posts!: Post[] | null;
  total!: string | null;
  input: postInput = {};
  env: any;
  private routeSub!: Subscription;

  constructor(
    public read: ReadService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public ns: NavService,
    private seo: SeoService,
    private pls: PostListService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.ns.openLeftNav();
    this.env = environment;

    if (this.ns.isBrowser) {
      this.user$ = this.read.userRec;
    }

    this.routeSub = this.route.data
      .subscribe(async (p) => this.loadPage(p));
  }

  async loadPage(p: any): Promise<void> {

    this.ns.resetBC();

    let count: string | null = p.posts?.count;
    let posts: Post[] | null = p.posts?.posts;
    let bookmarks: boolean = p.bookmarks;

    // dynamic routes
    const tag = this.route.snapshot.params['tag'];
    const authorId = this.route.snapshot.params['uid'];

    // set dynamic types
    const type: PostType = bookmarks
      ? 'bookmarks'
      : tag
        ? 'tag'
        : authorId
          ? 'user'
          : this.pls.type;

    // handle re-routing cases
    if (!posts && !type) {
      return;
    }

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

    // requires login

    const loggedInType = type === 'bookmarks' || type === 'drafts' || type === 'user';

    if (this.ns.isBrowser && loggedInType) {
      const _user = await this.auth.getUser();
      this.input.uid = _user?.uid;
      if (!this.input.uid) {
        this.router.navigate(['login']);
        return;
      }
    }

    // grab posts
    ({ count, posts } = await this.read.getPosts(this.input));

    this.meta(type);

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

    const { posts, count, error } = await this.read.getPosts({
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

  meta(type: PostType) {

    const posts = this.posts;

    // meta data
    if (type === 'bookmarks') {
      if (this.router.url === '/bookmarks') {
        this.ns.addTitle('Bookmarks');
      } else {
        this.ns.addTitle('Dashboard');
        this.ns.addBC('Bookmarks');
      }
    } else if (type === 'tag') {
      const tag = this.input.tag;
      const uTag = tag!.charAt(0).toUpperCase() + tag!.slice(1);
      this.ns.setBC(uTag);
      this.seo.generateTags({
        title: uTag + ' - ' + this.env.title
      });
    } else if (type === 'user') {
      if (this.router.url === '/dashboard') {
        this.ns.addTitle('Dashboard');
        this.ns.addBC('Posts');
      } else {
        this.ns.addTitle('User');
      }
    } else if (type === 'drafts') {
      this.ns.addTitle('Dashboard');
      this.ns.addBC('Drafts');
    } else {
      this.seo.generateTags({ title: this.env.title });
      this.ns.resetBC();
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
