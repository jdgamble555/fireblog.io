import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthSettingsRoutingModule } from './auth-settings-routing.module';
import { AuthSettingsComponent } from './auth-settings.component';


@NgModule({
  declarations: [AuthSettingsComponent],
  imports: [
    CommonModule,
    AuthSettingsRoutingModule,
  ]
})
export class AuthSettingsModule { }
