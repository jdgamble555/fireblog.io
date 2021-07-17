import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';

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

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;

  readonly separatorKeysCodes = [ENTER, COMMA];

  tags: Tag[] = [];

  constructor() { }

  /**
   * Change tags from associative array to array for Firestore
   * @param _tags tags
   */
  getTags() {
    const tags: string[] = [];
    this.tags.forEach((tag: any) => {
      tags.push(this.tagFormat(tag.name));
    });
    return tags;
  }

  // return tags with no / or uppercase characters
  private tagFormat(tag: string) {
    return tag.toLowerCase().replace(/-+/g, ' ').replace(/[^\w ]+/g, '');
  }

  /**
   * Add tags to tag array
   * @param tags
   */
  patch(tags: string[]) {
    for (let i = 0; i < tags.length; ++i) {
      this.tags.push({ name: tags[i].trim() });
    }
  }

  /**
   * Adds a tag to the form field
   * Necessary for MatChips
   * @param event - mat chip input event
   * @param tags - tags array
   */
  add(event: MatChipInputEvent, form: AbstractControl | null): any {
    // add tag from keyboard
    const input = event.chipInput;
    const value = event.value;
    // Reset the input value
    if (input) {
      input.clear();
    }
    // Add tag
    if ((value || '').trim()) {
      this.tags.push({ name: value.trim() });
    }
    // set value for validation
    form?.setValue(this.tags);

    return this.tags;
  }

  /**
   * Removes the tag from the form field
   * Necessary for MatChips
   * @param tag tag
   * @param tags - tags array
   */
  remove(tag: any): any {
    // remove tag
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    return this.tags;
  }

}
