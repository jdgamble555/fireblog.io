import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
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
  sub: Subscription;

  constructor(
    public read: ReadService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private ns: NavService,
    private seo: SeoService
  ) {

    this.ns.openLeftNav();

    this.sub = this.route.paramMap.subscribe((r: ParamMap) => {
      const tag = r.get('tag');
      const uid = r.get('uid');
      if (tag) {
        // posts by tag list
        const uTag = tag.charAt(0).toUpperCase() + tag.slice(1);
        this.ns.setBC('# ' + uTag);
        this.seo.generateTags({
          title: uTag + ' - ' + this.ns.title
        });
        this.posts = this.read.getPostsByTag(tag);
      } else if (uid) {
        // posts by user list
        this.ns.setBC('User');
        this.seo.generateTags({ title: 'User - ' + this.ns.title });
        this.posts = this.read.getPostsByUser(uid);
      } else {
        // all posts
        this.seo.generateTags({ title: this.ns.title });
        this.ns.resetBC();
        this.posts = this.read.getPosts();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

}
