import { Component, isDevMode } from '@angular/core';
import { ReadService } from '@db/read.service';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent {

  total: Observable<string>;

  isDev: boolean;

  constructor(private read: ReadService) {
    this.total = this.read.getTotal('posts');
    this.isDev = isDevMode();
  }

}
