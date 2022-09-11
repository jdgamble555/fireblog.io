import { NgModule } from '@angular/core';

import { AuthSettingsRoutingModule } from './auth-settings-routing.module';
import { AuthSettingsComponent } from './auth-settings.component';
import { ReLoginComponent } from './re-login/re-login.component';
import { SharedModule } from '@shared/shared.module';
import { AuthEditModule } from '@db/auth-edit.module';


@NgModule({
  declarations: [
    AuthSettingsComponent,
    ReLoginComponent
  ],
  imports: [
    AuthSettingsRoutingModule,
    SharedModule,
    AuthEditModule
  ]
})
export class AuthSettingsModule { }
