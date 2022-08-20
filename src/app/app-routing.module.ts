import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { LoginGuard, EmailGuard, NotLoginGuard, UsernameGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { PostComponent } from './post/post.component';

const routes: Routes = [
  { path: '', component: HomeComponent },

  // auth
  { path: 'login', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'passwordless', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: '_login', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'register', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'reset', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'verify', component: AuthComponent, canActivate: [LoginGuard] },
  { path: 'username', component: AuthComponent, canActivate: [LoginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [LoginGuard] },

  // backwards compatible with old app, will be removed later
  { path: 'blog/post/:slug', component: PostComponent },

  // posts
  { path: 'post/:id', component: PostComponent },
  { path: 'post/:id/:slug', component: PostComponent },
  { path: 't/:tag', component: PostListComponent },
  { path: 'user/:uid', component: PostListComponent },
  { path: 'bookmarks', component: PostListComponent, canActivate: [LoginGuard] },

  // logged in
  { path: 'new', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [EmailGuard, LoginGuard, UsernameGuard] },
  { path: 'edit/:id', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [EmailGuard, LoginGuard, UsernameGuard] },
  { path: 'settings', loadChildren: () => import('./auth/auth-settings/auth-settings.module').then(m => m.AuthSettingsModule), canActivate: [LoginGuard] },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
