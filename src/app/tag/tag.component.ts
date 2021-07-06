import { Component, OnInit, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(
    private tools: ToolsService,
    public ts: TagService,
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
}
