import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { NavService } from 'src/app/nav/nav.service';
import { SeoService } from 'src/app/shared/seo/seo.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {

  posts: Observable<Post[]>;

  constructor(
    public ps: PostService,
    private seo: SeoService,
    private ns: NavService,
    public auth: AuthService
  ) {
    this.posts = this.ps.getPosts();
    this.seo.generateTags({ domain: this.ns.title, title: this.ns.title + ': Home' });
  }

  ngOnInit(): void { }

}
