import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthSettingsComponent } from './auth-settings.component';

const routes: Routes = [
  {
    path: '', component: AuthSettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthSettingsRoutingModule { }
