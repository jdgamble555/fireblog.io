import { Injectable } from '@angular/core';
import { PostType } from '@post/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostListService {

  // shared controls for active post list type
  type: PostType;

  constructor() {
    this.type = 'new';
  }
}
