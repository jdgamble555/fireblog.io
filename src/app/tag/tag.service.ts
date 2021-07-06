import { Injectable } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { BreadCrumbsService } from '../shared/bread-crumbs/bread-crumbs.service';

export interface Tag {
  name: string;
}

@Injectable({
  providedIn: 'root'
})

/**
 * A bunch of tools for dealing with Tags
 */
export class TagService {

  readonly tagURL = '/blog/tag';
  readonly postURL = '/blog/post';

  constructor(private bcs: BreadCrumbsService) {
  }

  /**
   * Change tags from associative array to array for Firestore
   * @param _tags tags
   */
  initTags(_tags: any) {

    const tags: string[] = [];

    _tags.forEach((tag: any) => {
      tags.push(this.tagFormat(tag.name));
    });

    return tags;
  }

  // return tags with no / or uppercase characters
  tagFormat(tag: string) {
    return tag.toLowerCase().replace(/-+/g, ' ').replace(/[^\w ]+/g, '');
  }

  /**
   * Adds a tag to an array
   * Necessary for MatChips
   * @param tag - tag
   * @param tags - tags array
   */
  _addTag(tags: any, tag: any) {

    // Add tag
    if ((tag || '').trim()) {
      tags.push({ name: tag.trim() });
    }
    return tags;
  }

  /**
   * Adds a tag to the form field
   * Necessary for MatChips
   * @param event - mat chip input event
   * @param tags - tags array
   */
  add(tags: any, event: MatChipInputEvent): any {
    // add tag from keyboard
    const input = event.input;
    const value = event.value;

    // Reset the input value
    if (input) {
      input.value = '';
    }

    return this._addTag(tags, value);
  }

  /**
   * Removes the tag from the form field
   * Necessary for MatChips
   * @param tag tag
   * @param tags - tags array
   */
  remove(tags: any, tag: any): any {
    // remove tag
    const index = tags.indexOf(tag);

    if (index >= 0) {
      tags.splice(index, 1);
    }

    return tags;
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
