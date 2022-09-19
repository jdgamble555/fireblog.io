import { Component } from '@angular/core';
import { NavService } from '@nav/nav.service';

@Component({
  selector: 'app-subheader',
  templateUrl: './subheader.component.html',
  styleUrls: ['./subheader.component.scss']
})
export class SubheaderComponent {

  constructor(public ns: NavService) { }

}
