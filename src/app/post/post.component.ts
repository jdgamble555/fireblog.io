import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserRec } from '@auth/user.model';
import { ReadService } from '@db/read.service';
import { environment } from '@env/environment';
import { NavService } from '@nav/nav.service';
import { SeoService } from '@shared/seo/seo.service';
import { MarkdownService } from 'ngx-markdown';
import { Observable, Subscription } from 'rxjs';
import { Post } from './post.model';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent {

  paramSub!: Subscription;
  postSub!: Subscription;
  userSub!: Subscription;
  post!: Post | null;
  user$!: Observable<UserRec | null>;
  postId!: string;
  slug!: string;

  // todo - type this
  env: any;

  constructor(
    private route: ActivatedRoute,
    public read: ReadService,
    private seo: SeoService,
    public ns: NavService,
    private ms: MarkdownService
  ) {
    this.env = environment;
    this.ns.openLeftNav();
    const post = this.route.snapshot.data.post;
    this.meta(post);
    this.post = post;
    this.user$ = this.read.userRec;
  }

  meta(r: Post) {

    // add bread crumbs
    this.ns.setBC(r.title as string);
    let description = this.ms.parse(r.content as string);
    description = description.substring(0, 125).replace(/(\r\n|\n|\r)/gm, "");

    // generate seo tags
    this.seo.generateTags({
      title: r.title + ' - ' + this.env.title,
      domain: this.env.title,
      image: r.image || undefined,
      description,
      user: environment.author
    });

    // generate schema
    this.seo.setBlogSchema({
      title: r.title,
      author: environment.author,
      image: r.image || undefined,
      description,
      keywords: r.tags.join(', '),
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
      time: r.minutes
    });
  }
}
