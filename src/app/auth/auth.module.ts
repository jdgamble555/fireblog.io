import { NgModule } from '@angular/core';
import { MaterialModule } from '@core/material.module';
import { AuthDbModule } from '@db/auth-db.module';
import { SharedModule } from '@shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';


@NgModule({
  declarations: [
    AuthComponent
  ],
  imports: [
    SharedModule,
    AuthRoutingModule,
    AuthDbModule,
    MaterialModule
  ]
})
export class AuthModule { }
