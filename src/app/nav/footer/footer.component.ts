import { Component} from '@angular/core';
import { NavService } from '../nav.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  constructor(public nav: NavService) {  }


}
