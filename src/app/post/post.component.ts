import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NavService } from '../nav/nav.service';
import { AuthService } from '../platform/firebase/auth.service';
import { ReadService } from '../platform/firebase/read.service';
import { SeoService } from '../shared/seo/seo.service';
import { Post } from './post.model';

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
    private read: ReadService,
    public auth: AuthService,
    private seo: SeoService,
    private ns: NavService
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe(async (p: any) => {
      this.post = this.read.getPostById(p.id).pipe(
        tap((r: Post) => {
          // if post from id
          if (r) {
            // add bread crumbs
            this.ns.setBC(r.title as string);
            // generate seo tags
            this.seo.generateTags({
              domain: this.ns.title,
              image: r.image || undefined,
              description: r.content,
              title: r.title + ' - ' + this.ns.title
            });
            // check slug
            if (r.slug !== p.slug) {
              this.router.navigate(['/post', p.id, r.slug]);
            }
          } else {
            this.router.navigate(['/home']);
          }
        })
      );
    });
  }
}
