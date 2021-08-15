import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../nav/nav.service';
import { SeoService } from '../shared/seo/seo.service';
import { TagService } from '../tag/tag.service';
import { Post } from './post.model';
import { PostService } from './post.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  post!: Observable<Post>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ps: PostService,
    public auth: AuthService,
    public ts: TagService,
    private seo: SeoService,
    private ns: NavService
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe(async (p: any) => {
      this.post = this.ps.getPostById(p.id).pipe(
        tap((r: Post) => {
          // add bread crumbs
          this.ns.setBC(r.title as string);
          // generate seo tags
          this.seo.generateTags({
            domain: this.ns.title,
            image: r.image,
            description: r.content,
            title: this.ns.title + ': ' + r.title
          });
          // check slug
          if (r.slug !== p.slug) {
            this.router.navigate(['/post', p.id, r.slug]);
          }
        })
      );
    });
  }
}
