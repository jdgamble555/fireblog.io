import { NgModule } from '@angular/core';
import { FireFormDirective } from './fire-form.directive';
import { NavModule } from '../nav/nav.module';


const modules= [
  NavModule
];

@NgModule({
  declarations: [
    FireFormDirective
  ],
  imports: [...modules],
  exports: [...modules]
})
export class SharedModule { }
