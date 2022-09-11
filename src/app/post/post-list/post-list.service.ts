import { Injectable } from '@angular/core';
import { PostDbService } from '@db/post/post-db.service';
import { TagDbService } from '@db/post/tag-db.service';
import { PostType, Tag } from '@post/post.model';
import { StateService } from '@shared/state/state.service';

@Injectable({
  providedIn: 'root'
})
export class PostListService {

  // shared controls for active post list type and preloading data
  type: PostType;
  tags: Tag[] | null = null;
  postTotal: string | null = null;

  // set home view type
  constructor(
    private state: StateService,
    private ts: TagDbService,
    private ps: PostDbService
  ) {
    this.type = 'new';
  }

  // preload tags
  async loadTags(): Promise<void> {
    this.tags = await this.state.loadState('tag-list', this._getTags());
  }

  private async _getTags(): Promise<Tag[] | null> {

    const { data, error } = await this.ts.getTags();
    if (error) {
      console.error(error);
    }
    return data;
  }

  // preload post count
  async loadPostCount(): Promise<void> {
    this.postTotal = await this.state.loadState('post-count', this._getPostCount());
  }

  private async _getPostCount(): Promise<string | null> {
    const { data, error } = await this.ps.getTotal('posts');
    if (error) {
      console.error(error);
    }
    return data;
  }
}
