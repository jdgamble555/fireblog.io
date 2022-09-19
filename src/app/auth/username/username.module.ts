import { NgModule } from '@angular/core';
import { UsernameRoutingModule } from './username-routing.module';
import { SharedModule } from '@shared/shared.module';
import { UsernameComponent } from './username.component';
import { UserEditService } from '@db/user/user-edit.service';
import { MaterialModule } from '@core/material.module';


@NgModule({
  declarations: [UsernameComponent],
  imports: [
    SharedModule,
    UsernameRoutingModule,
    MaterialModule
  ],
  providers: [UserEditService]
})
export class UsernameModule { }
