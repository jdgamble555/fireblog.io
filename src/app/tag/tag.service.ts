import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';

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

  constructor(private fb: FormBuilder) { }

  /**
   * Get tags from form control
   * @param _tags tags
   */
  getTags(control: FormArray): string[] {
    let tags = [];
    for (let i = 0; i < control.length; ++i) {
      tags.push(control.at(i).value);
    }
    return tags;
  }

  /**
   * Adds an array of tags to a form control
   * @param tags
   * @param control
   */
  addTags(tags: string[], control: FormArray): void {
    for (let i = 0; i < tags.length; ++i) {
      this.addTag(this.tagFormat(tags[i]), control);
    }
  }

  /**
   * Adds a tag to the form control
   * @param tag
   * @param control
   */
  addTag(tag: string, control: FormArray): void {
    control.push(this.fb.control(this.tagFormat(tag)));
  }

  /**
   * Adds a tag to the form field
   * Necessary for MatChips
   * @param event - mat chip input event
   * @param tags - tags array
   */
  add(event: MatChipInputEvent, control: FormArray, chipList: MatChipList): void {
    // add tag from keyboard
    const input = event.chipInput;
    const value = event.value;

    // Get rid of duplicates
    if (!(control.value as string[]).includes(value)) {

      // Add tag to new form group
      if (value.trim()) {
        this.addTag(this.slugify(value), control);
      }
    }

    // Reset the input value
    if (input) {
      input.clear();
    }

    // Reset chipList Validation Bug Fix
    chipList.errorState = control.invalid;
  }

  /**
   * Removes the tag from the form field
   * Necessary for MatChips
   * @param tag tag
   * @param tags - tags array
   */
  remove(index: number, control: FormArray): void {
    control.removeAt(index);
  }

  /**
   * Required Validator for tags
   * @param control
   * @returns
   */
  tagValidatorRequired(control: AbstractControl): ValidationErrors | null {
    return (control.value && control.value.length === 0)
      ? { required: true }
      : null;
  };

  /**
   * Required Validator for tags
   * @param control
   * @returns
   */
  tagValidatorMin(min: number): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      return (control.value && control.value.length > min)
        ? { min: true }
        : null;
    }
  };

  /**
   * Format a tag in db for viewing
   * @param tag
   * @returns
   */
  private tagFormat(tag: string): string {
    return tag.toLowerCase().replace(/-+/g, ' ').replace(/[^\w ]+/g, '');
  }

  /**
   * Create a slug from a string
   * @param value
   * @returns
   */
  slugify(value: string): string {
    return value
      .split('-').join(' ')
      .normalize('NFD') // split an accented letter in the base letter and the accent
      .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
      .replace(/\s+/g, '-') // separator
  }

}
