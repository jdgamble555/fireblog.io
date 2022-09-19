import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  EmailGuard,
  LoginGuard,
  NotLoginGuard,
  NotUsernameGuard,
  UserPostGuard
} from '@auth/auth.guard';
import { PostListComponent } from '@post/post-list/post-list.component';
import { PostListResolver } from '@post/post-list/post-list.resolver';
import { PostComponent } from '@post/post.component';
import { PostGuard } from '@post/post.guard';
import { HomeComponent } from './nav/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent, resolve: { posts: PostListResolver } },

  // backwards compatible with old app, will be removed later
  { path: 'blog/post/:slug', component: PostComponent, canActivate: [PostGuard] },

  // posts
  // todo - p instead of post
  { path: 'post/:id', component: PostComponent, canActivate: [PostGuard] },
  { path: 'post/:id/:slug', component: PostComponent, canActivate: [PostGuard] },
  { path: 't/:tag', component: PostListComponent, resolve: { posts: PostListResolver } },
  { path: 'u/:uid', component: PostListComponent, canActivate: [UserPostGuard] },
  { path: 'u/:uid/:username', component: PostListComponent, canActivate: [UserPostGuard], resolve: { posts: PostListResolver } },

  // auth
  { path: 'login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: 'passwordless', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: '_login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: 'register', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: 'reset', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: 'verify', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [LoginGuard] },

  // logged in
  { path: 'new', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [EmailGuard, LoginGuard] },
  { path: 'edit/:id', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [EmailGuard, LoginGuard] },
  { path: 'settings', loadChildren: () => import('./auth/auth-settings/auth-settings.module').then(m => m.AuthSettingsModule), canActivate: [LoginGuard] },
  { path: 'username', loadChildren: () => import('./auth/username/username.module').then(m => m.UsernameModule), canActivate: [LoginGuard, NotUsernameGuard] },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [LoginGuard] },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
