import { Component, OnInit } from '@angular/core';
import { ReadService } from '@db/read.service';
import { NavService } from '@nav/nav.service';
import { Tag } from '../post.model';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit {

  tags!: Tag[];

  constructor(
    private read: ReadService,
    private ns: NavService
  ) { }

  async ngOnInit(): Promise<void> {
    // get tags
    this.tags = await this.ns.load('tags', this.read.subTags());
  }
}
