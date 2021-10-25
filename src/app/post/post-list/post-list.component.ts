import { ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { NavService } from 'src/app/nav/nav.service';
import { ReadService } from 'src/app/platform/mock/read.service';
import { SeoService } from 'src/app/shared/seo/seo.service';
import { Post } from '../post.model';
import { User } from '../../auth/user.model';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {

  posts!: Post[] | null;
  user!: User | null;
  total!: string | null;
  private _posts!: Observable<Post[]>;
  private totalPosts!: Observable<string>;
  private postsSub!: Subscription;
  private userSub!: Subscription;
  private paramSub!: Subscription;
  private totalSub!: Subscription;


  @Input() type!: string;

  tag!: string | null;
  uid!: string | null;

  constructor(
    public read: ReadService,
    private route: ActivatedRoute,
    private router: Router,
    public ns: NavService,
    private seo: SeoService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.userSub = this.read.userDoc
      .subscribe((user: User | null) => this.user = user);
  }

  ngOnInit(): void {
    this.ns.openLeftNav();
    this.paramSub = this.route.paramMap.subscribe(async (r: ParamMap) => this.loadPage(r));
  }

  async loadPage(r: ParamMap): Promise<void> {
    const tag = this.tag = r.get('tag');
    const uid = this.uid = r.get('uid');

    if (this.router.url === '/bookmarks') {
      // meta
      this.ns.setBC('Bookmarks');
      this.seo.generateTags({ title: 'Bookmarks - ' + this.ns.title });
      // posts
      // must wait for uid to load bookmarks
      const _uid = (await this.read.userDoc.pipe(take(1)).toPromise())?.uid;
      if (_uid) {
        this._posts = this.read.getPosts({ uid: _uid, field: 'bookmarks' });
        this.totalPosts = this.read.getUserTotal(_uid, 'bookmarks');
      } else {
        this.router.navigate(['login']);
      }
    } else if (this.type === 'liked') {
      // posts by hearts
      this._posts = this.read.getPosts({
        sortField: 'createdAt',
        field: 'hearts'
      });
      this.totalPosts = this.read.getTotal('hearts');
    } else if (this.type === 'updated') {
      // posts by updatedAt
      this._posts = this.read.getPosts({ sortField: 'updatedAt' });
      this.totalPosts = this.read.getTotal('posts');
    } else if (tag) {
      // meta
      const uTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      this.ns.setBC('# ' + uTag);
      this.seo.generateTags({
        title: uTag + ' - ' + this.ns.title
      });
      // posts by tag list
      this._posts = this.read.getPosts({ tag });
      this.totalPosts = this.read.getTagTotal(tag);
    } else if (uid) {
      // meta
      this.ns.setBC('User');
      this.seo.generateTags({ title: 'User - ' + this.ns.title });
      // posts by user list
      this._posts = this.read.getPosts({ uid });
      this.totalPosts = this.read.getUserTotal(uid, 'posts');
    } else {
      // meta
      this.seo.generateTags({ title: this.ns.title });
      this.ns.resetBC();
      // all posts
      this._posts = this.read.getPosts();
      this.totalPosts = this.read.getTotal('posts');
    }
    this.totalSub = this.totalPosts
      .subscribe((total: string) =>
        this.total = total == '0' || total === undefined
          ? 'none'
          : total
      );
    this.createPost();
  }

  createPost() {
    // create post subscription with change detection
    if (this.postsSub) {
      this.postsSub.unsubscribe();
    }
    this.postsSub = this.postPipe(this._posts)
      .subscribe((p: Post[] | null) => {
        this.posts = p;
        this.cdr.detectChanges();
      });
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

  pageChange(event: PageEvent): void {

    // pages
    const paging = {
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    };

    // which route
    if (this.router.url === '/bookmarks') {
      const uid = this.uid as string;
      this._posts = this.read.getPosts({
        uid,
        field: 'bookmarks',
        ...paging
      });
    } else if (this.tag) {
      this._posts = this.read.getPosts({
        tag: this.tag,
        ...paging
      });
    } else if (this.uid) {
      this._posts = this.read.getPosts({
        uid: this.uid,
        ...paging
      });
    } else {
      this._posts = this.read.getPosts(paging);
    }
    this.createPost();

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
    this.paramSub.unsubscribe();
    this.userSub.unsubscribe();
    this.postsSub.unsubscribe();
    this.totalSub.unsubscribe();
  }
}
