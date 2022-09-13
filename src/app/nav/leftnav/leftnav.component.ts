import { Component, isDevMode } from '@angular/core';
import { LeftnavService } from './leftnav.service';

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent {

  total!: string | null;
  isDev: boolean;

  constructor(private lns: LeftnavService) {
    this.isDev = isDevMode();
    this.total = this.lns.postTotal;
  }
}
