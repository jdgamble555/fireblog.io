import { Component } from '@angular/core';
import { Tag } from '../post.model';
import { TagListService } from './tag-list.service';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent {

  tags!: Tag[] | null;

  constructor(private tls: TagListService) {
    this.tags = this.tls.tags;
  }
}
