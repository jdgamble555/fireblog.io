import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReadService } from '@db/read.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-heart',
  templateUrl: './heart.component.html',
  styleUrls: ['./heart.component.scss']
})
export class HeartComponent implements OnInit, OnDestroy {

  @Input() count: number | undefined;
  @Input() postId!: string;
  @Input() userId!: string | undefined;

  _state = false;
  _count = 0;

  private actionSub!: Subscription;

  ngOnInit(): void {
    if (this.userId) {
      const { error, data } = this.read.actionExists(this.postId, this.userId, 'hearts');
      if (error) {
        console.error(error);
      }
      this.actionSub = data.subscribe((state: boolean | null) => {
        if (state) {
          this._state = state;
        }
      });
    }
    this._count = this.count !== undefined ? this.count : this._count;
  }

  constructor(
    private read: ReadService,
    private router: Router
  ) { }

  toggle() {
    this.changeState();
    this.toggleDB(this._state);
  }

  private changeState() {
    this._state = !this._state;
    this._state ? this._count++ : this._count--;
  }

  private async toggleDB(toggle: boolean) {

    // toggle save and like
    if (this.userId) {
      const { error } = toggle
        ? await this.read.actionPost(this.postId, this.userId, 'hearts')
        : await this.read.unActionPost(this.postId, this.userId, 'hearts');

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
