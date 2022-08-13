import { Injectable } from '@angular/core';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  posts: Post[];

  constructor() {
    this.posts = [];
  }


  async loadPosts() {

    

  }

}
