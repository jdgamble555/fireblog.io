import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReadService } from '@db/read.service';
import { Subscription } from 'rxjs';
import { NavService } from 'src/app/nav/nav.service';

import { Tag } from '../post.model';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, OnDestroy {

  tagsSub!: Subscription;
  tags!: Tag[];

  constructor(
    private read: ReadService,
    public ns: NavService
  ) { }

  async ngOnInit(): Promise<void> {

    // get tags
    const tags = this.read.getTags();
    this.tags = await this.ns.load('tags', tags);

    // subscribe
    if (this.ns.isBrowser) {
      this.tagsSub = this.read.getTags().subscribe((t: Tag[]) => this.tags = t);
    }
  }

  ngOnDestroy(): void {
    if (this.tagsSub) this.tagsSub.unsubscribe();
  }
}
