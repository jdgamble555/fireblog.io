import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsernameComponent } from './username.component';

const routes: Routes = [
  { path: '', component: UsernameComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsernameRoutingModule { }
