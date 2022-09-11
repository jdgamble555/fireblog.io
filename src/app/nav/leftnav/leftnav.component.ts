import { Component, isDevMode } from '@angular/core';
import { PostListService } from '@post/post-list/post-list.service';

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent {

  total!: string | null;
  isDev: boolean;

  constructor(private pls: PostListService) {
    this.isDev = isDevMode();
    this.total = this.pls.postTotal;
  }

}
