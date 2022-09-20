import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserRec } from '@auth/user.model';
import { UserDbService } from '@db/user/user-db.service';
import { environment } from '@env/environment';
import { NavService } from '@nav/nav.service';
import { SeoService } from '@shared/seo/seo.service';
import { SnackbarService } from '@shared/snack-bar/snack-bar.service';
import { MarkdownService } from 'ngx-markdown';
import { Observable, of, Subscription } from 'rxjs';
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
  user$: Observable<UserRec | null> = of(null);
  postId!: string;
  slug!: string;

  env: any;

  constructor(
    private route: ActivatedRoute,
    private us: UserDbService,
    private seo: SeoService,
    public ns: NavService,
    private ms: MarkdownService,
    private sb: SnackbarService
  ) {
    this.env = environment;
    this.ns.openLeftNav();
    const post = this.route.snapshot.data.post;
    this.meta(post);
    this.post = post;
    this.user$ = this.ns.isBrowser ? this.us.user$ : of(null);
  }

  onCopyToClipboard(): void {
    this.sb.showMsg('Copied to clipboard!');
  }

  meta(r: Post) {

    // add bread crumbs
    this.ns.setBC(r?.title as string);
    let description = this.ms.parse(r?.content as string);
    description = description.substring(0, 125).replace(/(\r\n|\n|\r)/gm, "");

    // generate seo tags
    this.seo.generateTags({
      title: r?.title + ' - ' + this.env.title,
      domain: this.env.title,
      image: r?.image || undefined,
      description,
      user: r?.authorDoc.username
    });

    // generate schema
    // todo - create schema service, add full content, use new type within types
    this.seo.setBlogSchema({
      title: r?.title,
      author: r?.authorDoc.displayName,
      username: r?.authorDoc.username,
      authorId: r?.authorId,
      authorURL: `${environment.site}/u/${r?.authorId}/${r?.authorDoc.username}`,
      image: r?.image || undefined,
      description,
      keywords: r?.tags.join(', '),
      createdAt: new Date(r?.createdAt || null).toISOString(),
      updatedAt: new Date(r?.updatedAt || null).toISOString(),
      time: r?.minutes,
      id: r?.id,
      url: `${environment.site}/post/${r?.id}/${r?.slug}`
    });
  }
}
