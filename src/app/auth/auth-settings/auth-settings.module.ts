import { NgModule } from '@angular/core';

import { AuthSettingsRoutingModule } from './auth-settings-routing.module';
import { AuthSettingsComponent } from './auth-settings.component';
import { CoreModule } from 'src/app/core/core.module';
import { ReLoginComponent } from 'src/app/auth/auth-settings/re-login/re-login.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    AuthSettingsComponent,
    ReLoginComponent
  ],
  imports: [
    AuthSettingsRoutingModule,
    CoreModule,
    SharedModule
  ]
})
export class AuthSettingsModule { }
