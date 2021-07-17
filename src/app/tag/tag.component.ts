import { Component, OnInit, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreadCrumbsService } from '../shared/bread-crumbs/bread-crumbs.service';
import { ToolsService } from '../shared/tools.service';
import { TagService } from './tag.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent implements OnInit {

  @Input()
  display!: string;

  tags!: Observable<any>;

  maxNumPosts!: Observable<any>;

  readonly tagURL = '/blog/tag';
  readonly postURL = '/blog/post';

  constructor(
    private tools: ToolsService,
    public ts: TagService,
    private bcs: BreadCrumbsService
  ) { }

  async ngOnInit(): Promise<void> {

    //this.tags = this.ts.getAllTags();
    this.tags = this.tools.getAllTagsDoc().pipe(
      map((doc: any) => {
        const data = doc.payload.data();
        return data.tagsAggregate;
      })
    );

  }

  // return a formatted tags URL
  getTagsURL(tag: string) {
    return this.tagURL + '/' + this.bcs.getFriendlyURL(tag);
  }

  // return a formatted title URL
  getTitleURL(title: string) {
    return this.postURL + '/' + this.bcs.getFriendlyURL(title);
  }
}
