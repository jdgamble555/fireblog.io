import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { ReadService } from 'src/app/platform/firebase/read.service';
import { Post } from '../post.model';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {

  posts: Observable<Post[]>;

  constructor(
    public read: ReadService,
    public auth: AuthService
  ) {
    this.posts = this.read.getPosts();
  }

  ngOnInit(): void { }

}
