import { NgModule } from '@angular/core';
import { SnackbarService } from './snack-bar/snack-bar.service';
import { DocPipe } from './doc.pipe';
import { FireFormDirective } from './fire-form.directive';
import { NavModule } from '../nav/nav.module';


const modules= [
  NavModule
];

@NgModule({
  declarations: [
    DocPipe,
    FireFormDirective
  ],
  imports: [...modules],
  exports: [...modules],
  providers: [SnackbarService]
})
export class SharedModule { }
