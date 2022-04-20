import { Component } from '@angular/core';
import { NavService } from './nav.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  constructor(public ns: NavService) { }

}
