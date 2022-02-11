import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { CoreModule } from 'src/app/core/core.module';
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

  tags: Observable<Tag[]> | Promise<Tag[]>;

  constructor(
    private read: ReadService,
    public ns: NavService,
    private core: CoreModule
  ) {
    this.tags = this.core.waitFor(this.read.getTags());
  }
}
