import { Component, isDevMode, OnInit } from '@angular/core';
import { ReadService } from '@db/read.service';
import { NavService } from '@nav/nav.service';



@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent implements OnInit {

  total!: string | null;

  isDev: boolean;

  constructor(
    private read: ReadService,
    private ns: NavService
  ) {
    this.isDev = isDevMode();
  }

  async ngOnInit(): Promise<void> {
    const { data, error } = await this.ns.load('post-total', this.read.getTotal('posts'));
    if (error) {
      console.error(error);
    }
    this.total = data;
  }
}
