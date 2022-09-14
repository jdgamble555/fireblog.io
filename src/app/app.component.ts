import { Component } from '@angular/core';
import { NavService } from './nav/nav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {

  constructor(
    public ns: NavService
  ) { }
}
