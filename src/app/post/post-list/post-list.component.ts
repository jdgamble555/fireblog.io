import { Component, Input, OnDestroy } from '@angular/core';
import { User } from '@angular/fire/auth';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NavService } from 'src/app/nav/nav.service';
import { AuthService } from 'src/app/platform/mock/auth.service';
import { ReadService } from 'src/app/platform/mock/read.service';
import { SeoService } from 'src/app/shared/seo/seo.service';
import { Post } from '../post.model';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnDestroy {

  posts!: Observable<Post[]>;
  user$!: User | null;
  sub!: Subscription;

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
  ) {
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

  postPipe(p: Observable<Post[]>) {

    // pipe in likes and bookmarks
    let posts: Post[];
    return p.pipe(
      switchMap((r: Post[]) => {
        posts = r;
        return this.auth.user$;
      })
    ).pipe(
      switchMap((user: User | null) => {
        if (user) {
          this.user$ = user;
          const actions: any[] = [];
          posts.map((p: Post) => {
            if (p.id) {
              actions.push(
                this.read.getAction(p.id, user.uid, 'hearts'),
                this.read.getAction(p.id, user.uid, 'bookmarks')
              );
            }
          });
          return actions
            ? combineLatest(actions)
            : of(null);
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
    if (this.user$ && toggle !== undefined) {
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
