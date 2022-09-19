import { NgModule } from '@angular/core';

import { AuthSettingsRoutingModule } from './auth-settings-routing.module';
import { AuthSettingsComponent } from './auth-settings.component';
import { ReLoginComponent } from './re-login/re-login.component';
import { SharedModule } from '@shared/shared.module';
import { AuthEditModule } from '@db/auth-edit.module';
import { ConfirmDialogModule } from '@shared/confirm-dialog/confirm-dialog.module';
import { DropZoneDirective } from '@shared/drop-zone/drop-zone.directive';
import { MaterialModule } from '@core/material.module';

@NgModule({
  declarations: [
    AuthSettingsComponent,
    ReLoginComponent,
    DropZoneDirective
  ],
  imports: [
    AuthSettingsRoutingModule,
    SharedModule,
    AuthEditModule,
    ConfirmDialogModule,
    MaterialModule
  ]
})
export class AuthSettingsModule { }
