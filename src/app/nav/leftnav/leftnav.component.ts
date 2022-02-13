import { Component, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
import { ReadService } from 'src/app/platform/firebase/read.service';


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
