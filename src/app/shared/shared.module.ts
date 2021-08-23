import { NgModule } from '@angular/core';
import { FireFormDirective } from './fire-form.directive';
import { NavModule } from '../nav/nav.module';
import { AutoSaveDirective } from './auto-save.directive';
import { FormsModule } from '@angular/forms';


const modules = [
  NavModule,
  FormsModule
];

const directives = [
  FireFormDirective,
  AutoSaveDirective
]

@NgModule({
  declarations: [
    ...directives
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...directives
  ]
})
export class SharedModule { }
