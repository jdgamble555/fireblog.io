import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ReadService } from 'src/app/platform/mock/read.service';


@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent {

  total: Observable<string>;

  constructor(private read: ReadService) {
    this.total = this.read.getTotal('posts');
  }

}
