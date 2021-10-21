import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { NavService } from 'src/app/nav/nav.service';
import { AuthService } from 'src/app/platform/mock/auth.service';
import { ReadService } from 'src/app/platform/mock/read.service';
import { SeoService } from 'src/app/shared/seo/seo.service';
import { Post } from '../post.model';
import { User } from '../../auth/user.model';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {

  posts!: Observable<Post[] | null>;
  user$!: User | null;
  sub!: Subscription;
  loading = true;

  @Input() type!: string;

  totalPosts!: Observable<string>;

  tag!: string | null;
  uid!: string | null;

  constructor(
    public read: ReadService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public ns: NavService,
    private seo: SeoService
  ) { }

  ngOnInit(): void {
    this.ns.openLeftNav();
    this.sub = this.route.paramMap.subscribe(async (r: ParamMap) => this.loadPage(r));
  }

  async loadPage(r: ParamMap): Promise<void> {
    const tag = this.tag = r.get('tag');
    const uid = this.uid = r.get('uid');

    if (this.router.url === '/bookmarks') {
      // meta
      this.ns.setBC('Bookmarks');
      this.seo.generateTags({ title: 'Bookmarks - ' + this.ns.title });
      // posts
      const uid = (await this.auth.getUser())?.uid as string;
      this.posts = this.postPipe(
        this.read.getPosts({ uid, field: 'bookmarks' })
      );
      this.totalPosts = this.read.getUserTotal(uid, 'bookmarks');
    } else if (this.type === 'liked') {
      // posts by hearts
      this.posts = this.postPipe(
        this.read.getPosts({
          sortField: 'createdAt',
          field: 'hearts'
        })
      );
      this.totalPosts = this.read.getTotal('hearts');
    } else if (this.type === 'updated') {
      // posts by updatedAt
      this.posts = this.postPipe(
        this.read.getPosts({ sortField: 'updatedAt' })
      );
      this.totalPosts = this.read.getTotal('posts');
    } else if (tag) {
      // meta
      const uTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      this.ns.setBC('# ' + uTag);
      this.seo.generateTags({
        title: uTag + ' - ' + this.ns.title
      });
      // posts by tag list
      this.posts = this.postPipe(
        this.read.getPosts({ tag })
      );
      this.totalPosts = this.read.getTagTotal(tag);
    } else if (uid) {
      // meta
      this.ns.setBC('User');
      this.seo.generateTags({ title: 'User - ' + this.ns.title });
      // posts by user list
      this.posts = this.postPipe(
        this.read.getPosts({ uid })
      );
      this.totalPosts = this.read.getUserTotal(uid, 'posts');
    } else {
      // meta
      this.seo.generateTags({ title: this.ns.title });
      this.ns.resetBC();
      // all posts
      this.posts = this.postPipe(
        this.read.getPosts()
      );
      this.totalPosts = this.read.getTotal('posts');
    }
  }

  postPipe(p: Observable<Post[] | null>): Observable<Post[] | null> {
    // pipe in likes and bookmarks
    let posts: Post[];
    return p.pipe(
      switchMap((r: Post[] | null) => {
        if (r && r.length > 0) {
          posts = r;
        }
        return this.read.userDoc
      })
    ).pipe(
      switchMap((user: User | null) => {
        if (user) {
          this.user$ = user;
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
            if (actions) {
              return combineLatest(actions);
            }
          }
        }
        return of(null);
      }),
      map((s: any[] | null) => {
        if (s) {
          posts.map((p: Post) => {
            p.liked = s.shift();
            p.saved = s.shift();
            return p;
          });
        }
        this.loading = false;
        return posts;
      }),
      shareReplay()
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
      this.posts = this.postPipe(
        this.read.getPosts({
          uid,
          field: 'bookmarks',
          ...paging
        })
      );
    } else if (this.tag) {
      this.posts = this.postPipe(
        this.read.getPosts({
          tag: this.tag,
          ...paging
        })
      );
    } else if (this.uid) {
      this.posts = this.postPipe(
        this.read.getPosts({
          uid: this.uid,
          ...paging
        })
      );
    } else {
      this.posts = this.postPipe(
        this.read.getPosts(paging)
      );
    }
  }

  toggleAction(id: string, action: string, toggle?: boolean) {

    // toggle save and like
    if (this.user$ && this.user$.uid && toggle !== undefined) {
      toggle
        ? this.read.unActionPost(id, this.user$.uid, action)
        : this.read.actionPost(id, this.user$.uid, action);
    } else {
      this.router.navigate(['login']);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
