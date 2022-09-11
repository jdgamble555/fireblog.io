import { NgModule } from '@angular/core';
import { UsernameRoutingModule } from './username-routing.module';
import { SharedModule } from '@shared/shared.module';
import { UsernameComponent } from './username.component';
import { UserEditService } from '@db/user/user-edit.service';


// todo - delete this and create dashboard module
// todo - creat username guard for isloggedin and if exists
// todo - create post and post-list module
// todo - create separate module for login
// todo - figure out save and like modules (two different?)

@NgModule({
  declarations: [UsernameComponent],
  imports: [
    SharedModule,
    UsernameRoutingModule
  ],
  providers: [UserEditService]
})
export class UsernameModule { }
