import { Component, isDevMode, OnInit } from '@angular/core';
import { ReadService } from '@db/read.service';
import { NavService } from '@nav/nav.service';



@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.scss']
})
export class LeftnavComponent implements OnInit {

  total!: string;

  isDev: boolean;

  constructor(
    private read: ReadService,
    private ns: NavService
  ) {
    this.isDev = isDevMode();
  }

  async ngOnInit(): Promise<void> {
    this.total = await this.ns.load('total', this.read.getTotal('posts'));
  }

}
