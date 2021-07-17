import { NgModule } from '@angular/core';

import { AuthSettingsRoutingModule } from './auth-settings-routing.module';
import { AuthSettingsComponent } from './auth-settings.component';
import { CoreModule } from 'src/app/core/core.module';
import { DropZoneDirective } from 'src/app/shared/drop-zone/drop-zone.directive';
import { ImageUploadModule } from 'src/app/shared/image-upload/image-upload.module';
import { ConfirmDialogModule } from 'src/app/shared/confirm-dialog/confirm-dialog.module';
import { ReLoginComponent } from 'src/app/shared/re-login/re-login.component';


@NgModule({
  declarations: [
    AuthSettingsComponent,
    DropZoneDirective,
    ReLoginComponent
  ],
  imports: [
    AuthSettingsRoutingModule,
    CoreModule,
    ImageUploadModule,
    ConfirmDialogModule,
  ]
})
export class AuthSettingsModule { }
