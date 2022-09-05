import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReadService } from '@db/read.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.scss']
})
export class SaveComponent implements OnInit, OnDestroy {

  @Input() postId!: string;
  @Input() userId!: string | undefined;

  private _state = false;
  private actionSub!: Subscription;

  ngOnInit(): void {
    if (this.userId) {
      const { error, data } = this.read.actionExists(this.postId, this.userId, 'bookmarks');
      if (error) {
        console.error(error);
      }
      this.actionSub = data.subscribe((state: boolean | null) => {
        if (state) {
          this._state = state;
        }
      });
    }
  }

  constructor(
    private read: ReadService,
    private router: Router
  ) { }

  get state() {
    return this._state;
  }

  toggle() {
    this.changeState();
    this.toggleDB(this._state);
  }

  private changeState() {
    this._state = !this._state;
  }

  private async toggleDB(toggle: boolean) {

    // toggle save and like
    if (this.userId) {
      const { error } = toggle
        ? await this.read.actionPost(this.postId, this.userId, 'bookmarks')
        : await this.read.unActionPost(this.postId, this.userId, 'bookmarks');

      if (error) {
        // revert state
        this.changeState();
        console.error(error);
      }
    } else {
      this.router.navigate(['login']);
    }
  }

  ngOnDestroy(): void {
    if (this.actionSub) {
      this.actionSub.unsubscribe();
    }
  }
}
