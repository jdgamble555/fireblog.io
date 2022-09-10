import { NgModule } from '@angular/core';

import { AuthSettingsRoutingModule } from './auth-settings-routing.module';
import { AuthSettingsComponent } from './auth-settings.component';
import { ReLoginComponent } from './re-login/re-login.component';
import { SharedModule } from '@shared/shared.module';
import { CoreModule } from '@core/core.module';
import { AuthAccessModule } from '@db/auth/auth-access.module';


@NgModule({
  declarations: [
    AuthSettingsComponent,
    ReLoginComponent
  ],
  imports: [
    AuthSettingsRoutingModule,
    CoreModule,
    SharedModule,
    AuthAccessModule
  ]
})
export class AuthSettingsModule { }
