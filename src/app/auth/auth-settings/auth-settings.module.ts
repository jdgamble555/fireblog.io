import { NgModule } from '@angular/core';

import { AuthSettingsRoutingModule } from './auth-settings-routing.module';
import { AuthSettingsComponent } from './auth-settings.component';
import { CoreModule } from 'src/app/core/core.module';
import { ReLoginComponent } from './re-login/re-login.component';
import { SharedModule } from '@shared/shared.module';


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
