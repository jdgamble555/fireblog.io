import { Component } from '@angular/core';
import { PostListService } from '@post/post-list/post-list.service';
import { Tag } from '../post.model';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent {

  tags!: Tag[] | null;

  constructor(private pls: PostListService) {
    this.tags = this.pls.tags;
  }
}
