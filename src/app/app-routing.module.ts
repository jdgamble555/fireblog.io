import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  LoginGuard,
  NotLoginGuard,
  NotUsernameGuard,
  UsernameEmailVerifiedGuard
} from '@auth/auth.guard';
import { PostListComponent } from '@post/post-list/post-list.component';
import { PostListGuard } from '@post/post-list/post-list.guard';
import { PostComponent } from '@post/post.component';
import { PostGuard } from '@post/post.guard';
import { HomeComponent } from './nav/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [PostListGuard], data: { revalidate: 0 } },

  // backwards compatible with old app, will be removed later
  { path: 'blog/post/:slug', component: PostComponent, canActivate: [PostGuard] },

  // post
  { path: 'post/:id', component: PostComponent, canActivate: [PostGuard] },
  { path: 'post/:id/:slug', component: PostComponent, canActivate: [PostGuard], data: { revalidate: 0 } },

  // post list
  { path: 't/:tag', component: PostListComponent, canActivate: [PostListGuard], data: { revalidate: 0 } },
  { path: 'u/:uid', component: PostListComponent, canActivate: [PostListGuard] },
  { path: 'u/:uid/:username', component: PostListComponent, canActivate: [PostListGuard], data: { revalidate: 0 } },

  // auth
  { path: 'login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: 'passwordless', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: '_login', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: 'register', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: 'reset', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [NotLoginGuard] },
  { path: 'verify', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canActivate: [LoginGuard] },

  // logged in
  { path: 'new', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [UsernameEmailVerifiedGuard] },
  { path: 'edit/:id', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [UsernameEmailVerifiedGuard] },
  { path: 'settings', loadChildren: () => import('./auth/auth-settings/auth-settings.module').then(m => m.AuthSettingsModule), canActivate: [LoginGuard] },
  { path: 'username', loadChildren: () => import('./auth/username/username.module').then(m => m.UsernameModule), canActivate: [NotUsernameGuard] },
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
