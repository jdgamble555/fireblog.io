import { Component, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { NavService } from 'src/app/nav/nav.service';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { ReadService } from 'src/app/platform/firebase/read.service';
import { SeoService } from 'src/app/shared/seo/seo.service';
import { Post } from '../post.model';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnDestroy {

  posts!: Observable<Post[]>;
  user$: Observable<any>;
  sub!: Subscription;

  totalPosts!: Observable<string>;

  tag!: string | null;
  uid!: string | null;

  constructor(
    public read: ReadService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private ns: NavService,
    private seo: SeoService
  ) {

    this.user$ = this.ns.isBrowser ? this.auth.user$ : of(null);

    this.ns.openLeftNav();

    // parameters
    let params = this.route.paramMap;

    // only get 1 if server
    if (!this.ns.isBrowser) {
      params = params.pipe(take(1));
    }

    this.sub = params.subscribe((r: ParamMap) => this.loadPage(r));
  }

  loadPage(r: ParamMap) {
    const tag = this.tag = r.get('tag');
    const uid = this.uid = r.get('uid');
    if (tag) {
      // posts by tag list
      const uTag = tag.charAt(0).toUpperCase() + tag.slice(1);
      this.ns.setBC('# ' + uTag);
      this.seo.generateTags({
        title: uTag + ' - ' + this.ns.title
      });
      this.posts = this.read.getPosts({ tag });
      this.totalPosts = this.read.getTagTotal(tag);
    } else if (uid) {
      // posts by user list
      this.ns.setBC('User');
      this.seo.generateTags({ title: 'User - ' + this.ns.title });
      this.posts = this.read.getPosts({ uid });
      this.totalPosts = this.read.getUserTotal(uid, 'posts');
    } else {
      // all posts
      this.seo.generateTags({ title: this.ns.title });
      this.ns.resetBC();
      this.posts = this.read.getPosts();
      this.totalPosts = this.read.getTotal('posts');
    }
  }

  pageChange(event: PageEvent) {

    // pages
    const paging = {
      page: event.pageIndex + 1,
      pageSize: event.pageSize
    };

    // which route
    if (this.tag) {
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

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
