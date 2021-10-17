import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
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
export class PostListComponent implements OnInit, OnDestroy {

  posts!: Observable<Post[]>;
  user$!: User | null;
  sub!: Subscription;

  @Input() sort!: string;

  totalPosts!: Observable<string>;

  tag!: string | null;
  uid!: string | null;

  isBookmark!: boolean;

  constructor(
    public read: ReadService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public ns: NavService,
    private seo: SeoService
  ) {
    this.ns.openLeftNav();
  }

  async ngOnInit(): Promise<void> {

    // load browser page
    if (this.ns.isBrowser) {
      this.sub = this.route.paramMap.subscribe((r: ParamMap) => this.loadPage(r));
    }

    // load server version for seo
    if (!this.ns.isBrowser) {
      await this.route.paramMap.pipe(take(1)).toPromise()
        .then(async (r: ParamMap) => this.loadPage(r));
    }
  }

  async loadPage(r: ParamMap): Promise<void> {
    const tag = this.tag = r.get('tag');
    const uid = this.uid = r.get('uid');

    if (this.ns.isBrowser) {
      this.user$ = await this.auth.getUser();
    }
    if (this.router.url === '/bookmarks') {
      this.ns.setBC('Bookmarks');
      this.seo.generateTags({ title: 'Bookmarks - ' + this.ns.title });
      const uid = this.uid = this.user$?.uid as string;
      this.posts = this.read.getPosts({ bookmarks: uid });
      this.totalPosts = this.read.getUserTotal(uid, 'bookmarks');
    } else if (tag) {
      // meta
      const uTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      this.ns.setBC('# ' + uTag);
      this.seo.generateTags({
        title: uTag + ' - ' + this.ns.title
      });
      if (this.ns.isBrowser) {
        // posts by tag list
        this.posts = this.read.getPosts({ tag });
        this.totalPosts = this.read.getTagTotal(tag);
      }
    } else if (uid) {
      // meta
      this.ns.setBC('User');
      this.seo.generateTags({ title: 'User - ' + this.ns.title });
      if (this.ns.isBrowser) {
        // posts by user list
        this.posts = this.read.getPosts({ uid });
        this.totalPosts = this.read.getUserTotal(uid, 'posts');
      }
    } else {
      // meta
      this.seo.generateTags({ title: this.ns.title });
      this.ns.resetBC();
      // all posts
      if (this.ns.isBrowser) {
        this.posts = this.read.getPosts({ sortField: this.sort });
        this.totalPosts = this.read.getTotal('posts');
      }
    }
  }

  pageChange(event: PageEvent): void {

    // pages
    const paging = {
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    };

    // which route
    if (this.router.url === '/bookmarks') {
      console.log(this.uid)
      this.posts = this.read.getPosts({
        bookmarks: this.uid as string,
        ...paging
      });
    } else if (this.tag) {
      this.posts = this.read.getPosts({
        tag: this.tag,
        ...paging
      });
    } else if (this.uid) {
      this.posts = this.read.getPosts({
        uid: this.uid,
        ...paging
      })
    } else {
      this.posts = this.read.getPosts(paging);
    }
  }

  async toggleAction(action: string, id: string) {
    if (this.user$) {
      try {
        await this.read.actionPost(id, this.user$.uid, action);
      } catch (e: any) {
        if (e.code === 'permission-denied') {
          // already clicked
        }
      }
      this.isBookmark = true;
      setTimeout(() => {
        this.isBookmark = false;
      }, 500);
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
