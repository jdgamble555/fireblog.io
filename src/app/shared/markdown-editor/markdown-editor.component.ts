import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit {

  controlId!: string;

  @Input() public form!: FormGroup;
  @Input() public controlName!: string;
  @HostBinding('class.focus') isFocus!: boolean;

  constructor() { }

  ngOnInit(): void {
    this.controlId = `MarkdownEditor-${Math.floor(100000 * Math.random())}`;
  }

  focus() {
    this.isFocus = true;
  }

  blur() {
    this.isFocus = false;
  }

}
