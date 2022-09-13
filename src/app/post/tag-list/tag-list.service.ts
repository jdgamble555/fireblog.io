import { Injectable } from '@angular/core';
import { TagDbService } from '@db/post/tag-db.service';
import { Tag } from '@post/post.model';
import { StateService } from '@shared/state/state.service';

@Injectable({
  providedIn: 'root'
})
export class TagListService {

  // service to preload tags

  tags!: Tag[] | null;

  constructor(
    private state: StateService,
    private ts: TagDbService
  ) { }

  // preload tags
  async preloadTags(): Promise<void> {
    this.tags = await this.state.loadState('tag-list', this._getTags());
  }

  private async _getTags(): Promise<Tag[] | null> {

    const { data, error } = await this.ts.getTags();
    if (error) {
      console.error(error);
    }
    return data;
  }
}
