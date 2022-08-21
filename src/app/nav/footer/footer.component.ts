import { Component } from '@angular/core';
import { environment } from '@env/environment';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  env: any;

  constructor() {
    this.env = environment;
  }

}
