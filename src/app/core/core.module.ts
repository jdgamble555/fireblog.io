import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { AuthService } from '../auth/auth.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthComponent } from '../auth/auth.component';


const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  RouterModule
];

const components = [
  AuthComponent
];


@NgModule({
  imports: [...modules],
  exports: [
    ...modules,
    ...components
  ],
  declarations: [...components]
})
export class CoreModule { }