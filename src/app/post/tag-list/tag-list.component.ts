import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ReadService } from 'src/app/platform/mock/read.service';
import { Tag } from '../post.model';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent {

  @Input() display!: string;

  tags: Observable<Tag[]>;

  constructor(private read: ReadService) {
    this.tags = this.read.getTags();
  }
}
