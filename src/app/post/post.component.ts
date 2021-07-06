import { Component, OnInit, Input } from '@angular/core';
import { PostService } from './post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { TagService } from '../tag/tag.service';
import { switchMap } from 'rxjs/operators';
import { LikeService } from '../like/like.service';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NavService } from '../nav/nav.service';
import { User } from '../auth/user.model';


@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  @Input()
  category!: string;
  @Input()
  display!: string;

  domain = 'fireblog.io';

  posts!: Observable<any>;

  constructor(
    public auth: AuthService,
    public ps: PostService,
    private route: ActivatedRoute,
    public ts: TagService,
    public ls: LikeService,
    public nav: NavService
  ) {

    // this requires an open navbar
    this.nav.openLeftNav();
  }

  async ngOnInit(): Promise<void> {

    // get user before loading
    this.auth.user$.subscribe((user: User | any) => {
      // get route
      this.posts = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          if (this.category) {
            return this.ps.loadPosts(params, user, this.category);
          }
          return this.ps.loadPosts(params, user);
        })
      );
    });
  }
}
