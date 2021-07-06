import { Component, OnInit, Input } from '@angular/core';
import { LikeService } from './like.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-like',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss']
})
export class LikeComponent implements OnInit {

  @Input() userId!: string;
  @Input() postId!: string;

  likes!: Observable<any>;

  constructor(public ls: LikeService) { }

  ngOnInit(): void {
    this.likes = this.ls.getLike(this.userId, this.postId);
  }

}
