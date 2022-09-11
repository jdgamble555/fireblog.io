import { NgModule } from '@angular/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '@shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { PostListModule } from '@post/post-list/post-list.module';
import { NavModule } from '@nav/nav.module';


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule,
    PostListModule,
    NavModule
  ]
})
export class DashboardModule { }
