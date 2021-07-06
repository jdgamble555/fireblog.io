import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, EmailGuard } from '../auth/auth.guard';
import { PostFormComponent } from './post-form/post-form.component';
import { PostComponent } from './post.component';

const routes: Routes = [
  { path: '', component: PostComponent },
  { path: 'page/:page', component: PostComponent },
  { path: 'new', component: PostFormComponent, canActivate: [AuthGuard] },
  { path: 'edit/:post', component: PostFormComponent, canActivate: [AuthGuard, EmailGuard] },
  { path: 'post/:title', component: PostComponent },
  { path: 'user/:user', component: PostComponent },
  { path: 'user/:user/page/:page', component: PostComponent },
  { path: 'tag/:tag', component: PostComponent },
  { path: 'tag/:tag/page/:page', component: PostComponent },
  { path: 'my-posts', component: PostComponent, canActivate: [AuthGuard] },
  { path: 'my-posts/page/:page', component: PostComponent, canActivate: [AuthGuard] },
  { path: 'favorites', component: PostComponent, canActivate: [AuthGuard] },
  { path: 'favorites/page/:page', component: PostComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostRoutingModule { }
