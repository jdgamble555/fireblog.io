import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, firstValueFrom, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { NavService } from 'src/app/nav/nav.service';
import { ReadService } from 'src/app/platform/firebase/read.service';
import { SeoService } from 'src/app/shared/seo/seo.service';
import { Post } from '../post.model';
import { UserRec } from '../../auth/user.model';
import { DOCUMENT } from '@angular/common';
import { environment } from '@env/environment';

interface postInput {
  sortField?: string,
  sortDirection?: 'desc' | 'asc',
  tag?: string,
  uid?: string,
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
export class PostListComponent implements OnInit, OnDestroy {

  user!: UserRec | null;
  posts!: Post[] | null;
  total!: string | null;
  //posts!: Observable<Post[] | null> | Promise<Post[] | null>;
  //total!: Observable<string | null> | Promise<string | null>;
  private postsSub!: Subscription;
  private userSub!: Subscription;
  private paramSub!: Subscription;
  private totalSub!: Subscription;

  @Input() type!: 'bookmarks' | 'liked' | 'updated' | 'user' | 'drafts';

  input!: postInput;

  env: any;

  constructor(
    public read: ReadService,
    private route: ActivatedRoute,
    private router: Router,
    public ns: NavService,
    private seo: SeoService,
    @Inject(DOCUMENT) private doc: Document
  ) {
    // reset posts input obj
    this.input = {};

    this.env = environment;
  }

  async ngOnInit(): Promise<void> {

    let paramSub = this.route.paramMap;

    if (this.ns.isBrowser) {
      this.userSub = this.read.userRec
        .subscribe((user: UserRec | null) => this.user = user);
    } else {
      // ssr
      paramSub = paramSub.pipe(take(1));
    }
    this.paramSub = this.route.paramMap
      .subscribe(async (r: ParamMap) => await this.loadPage(r));
  }

  async loadPage(r: ParamMap): Promise<void> {

    const tag = r.get('tag');
    const uid = r.get('uid');
    if (tag) {
      this.input.tag = tag;
    } else if (uid) {
      this.input.uid = uid;
    }

    // get uid for user
    if (this.type === 'bookmarks' || this.type === 'drafts' || this.type === 'user') {
      this.input.uid = (await firstValueFrom(this.read.userRec))?.uid || undefined;
      if (!this.input.uid) {
        this.router.navigate(['login']);
      }
    }

    if (this.router.url === '/bookmarks' || this.type === 'bookmarks') {
      // meta
      if (this.router.url === '/bookmarks') {
        this.ns.openLeftNav();
        this.ns.addTitle('Bookmarks');
      }
      this.input.field = 'bookmarks';
    } else if (this.type === 'liked') {
      // posts by hearts
      this.input.sortField = 'heartsCount';
    } else if (this.type === 'updated') {
      // posts by updatedAt
      this.input.sortField = 'updatedAt';
    } else if (this.input?.tag) {
      // meta
      const tag = this.input.tag;
      const uTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      this.ns.setBC('# ' + uTag);
      this.seo.generateTags({
        title: uTag + ' - ' + this.env.title
      });
    } else if (this.type === 'drafts') {
      this.input.drafts = true;
    } else if (this.input?.uid) {
      // meta
      this.ns.addTitle('User');
    } else {
      // meta
      this.seo.generateTags({ title: this.env.title });
      this.ns.resetBC();
    }

    const { count, posts } = this.read.getPosts(this.input);

    if (count) {
      this.total = await this.ns.load('count', count);
      if (this.ns.isBrowser) {
        this.totalSub = count.subscribe((t: string) => this.total = t);
      }
    }
    if (posts) {
      this.createPost(posts);
    }
  }

  async createPost(posts: Observable<Post[] | null>) {

    posts = this.postPipe(posts);

    // unsubscribe to existing subscription
    if (this.postsSub) {
      this.postsSub.unsubscribe();
    }

    // get promise posts, then subscribe
    this.posts = await this.ns.load('posts', posts);
    if (this.ns.isBrowser) {
      this.postsSub = posts.subscribe((p: Post[] | null) => this.posts = p);
    }
  }

  postPipe(p: Observable<Post[] | null>): Observable<Post[] | null> {
    // pipe in likes and bookmarks
    let posts: Post[] = [];
    return p.pipe(
      switchMap((r: Post[] | null) => {
        if (posts) {
          posts = [];
        }
        if (r && r.length > 0) {
          posts = r;
        }
        const user = this.user;
        if (user) {
          if (posts) {
            const actions: any[] = [];
            posts.map((_p: Post) => {
              if (_p.id && user.uid) {
                actions.push(
                  this.read.getAction(_p.id, user.uid, 'hearts'),
                  this.read.getAction(_p.id, user.uid, 'bookmarks')
                );
              }
            });
            if (actions.length > 0) {
              return combineLatest(actions);
            }
          }
        }
        return of(null);
      }),
      map((s: any[] | null) => {
        if (s && s.length > 0) {
          posts.map((p: Post) => {
            p.liked = s.shift();
            p.saved = s.shift();
            return p;
          });
        }
        return posts;
      })
    );
  }

  async pageChange(event: PageEvent): Promise<void> {

    // pages
    const paging = {
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    };

    const { posts } = this.read.getPosts({
      ...this.input,
      ...paging
    });

    this.createPost(posts);

    // scroll to top
    this.doc.defaultView?.scrollTo(0, 0);
  }

  async toggleAction(id: string, action: string, toggle?: boolean) {
    // toggle save and like
    if (this.user && this.user.uid && toggle !== undefined) {
      toggle
        ? await this.read.unActionPost(id, this.user.uid, action)
        : await this.read.actionPost(id, this.user.uid, action);
    } else {
      this.router.navigate(['login']);
    }
  }

  ngOnDestroy(): void {
    // don't use template async for change detection after login
    if (this.paramSub) this.paramSub.unsubscribe();
    if (this.userSub) this.userSub.unsubscribe();
    if (this.postsSub) this.postsSub.unsubscribe();
    if (this.totalSub) this.totalSub.unsubscribe();
  }
}
