import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialCoreModule } from './material-core.module';


const modules = [
  CommonModule,
  ReactiveFormsModule,
  MaterialCoreModule,
  RouterModule
];

const components: any[] = [];

@NgModule({
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...components
  ],
  declarations: [
    ...components
  ]
})
export class CoreModule { }


