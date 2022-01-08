import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { NavService } from 'src/app/nav/nav.service';
import { ReadService } from 'src/app/platform/firebase/read.service';
import { Tag } from '../post.model';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent {

  @Input() display!: string;

  tags: Observable<Tag[]>;

  constructor(
    private read: ReadService,
    public ns: NavService
  ) {
    this.tags = this.read.getTags();
  }
}
