import { NgModule } from '@angular/core';
import { UsernameRoutingModule } from './username-routing.module';
import { SharedModule } from '@shared/shared.module';
import { UsernameComponent } from './username.component';
import { UserEditService } from '@db/user/user-edit.service';


// todo - create username guard for isloggedin and if exists
// todo - create separate module for login

@NgModule({
  declarations: [UsernameComponent],
  imports: [
    SharedModule,
    UsernameRoutingModule
  ],
  providers: [UserEditService]
})
export class UsernameModule { }
