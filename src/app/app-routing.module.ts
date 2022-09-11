import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsernameGuard } from '@auth/username/username.guard';
import { UserPostGuard } from '@post/post-list/post-list.guard';
import { PostListResolver } from '@post/post-list/post-list.resolver';
import { PostGuard } from '@post/post.guard';
import { PostResolver } from '@post/post.resolver';
import { AuthComponent } from './auth/auth.component';
import { LoginGuard, EmailGuard, NotLoginGuard } from './auth/auth.guard';
import { HomeComponent } from './home/home.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { PostComponent } from './post/post.component';

const routes: Routes = [
  { path: '', component: HomeComponent, resolve: { posts: PostListResolver } },

  // auth
  { path: 'login', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'passwordless', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: '_login', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'register', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'reset', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'verify', component: AuthComponent, canActivate: [LoginGuard] },

  // backwards compatible with old app, will be removed later
  { path: 'blog/post/:slug', component: PostComponent, canActivate: [PostGuard] },

  // posts
  // todo - p instead of post
  { path: 'post/:id', component: PostComponent, canActivate: [PostGuard] },
  { path: 'post/:id/:slug', component: PostComponent, canActivate: [PostGuard], resolve: { post: PostResolver } },
  { path: 't/:tag', component: PostListComponent, resolve: { posts: PostListResolver } },
  { path: 'u/:uid', component: PostListComponent, canActivate: [UserPostGuard] },
  { path: 'u/:uid/:username', component: PostListComponent, canActivate: [UserPostGuard], resolve: { posts: PostListResolver } },
  { path: 'bookmarks', component: PostListComponent, canActivate: [LoginGuard] },

  // logged in
  { path: 'new', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [EmailGuard, LoginGuard] },
  { path: 'edit/:id', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [EmailGuard, LoginGuard] },
  { path: 'settings', loadChildren: () => import('./auth/auth-settings/auth-settings.module').then(m => m.AuthSettingsModule), canActivate: [LoginGuard] },
  { path: 'username', loadChildren: () => import('./auth/username/username.module').then(m => m.UsernameModule), canActivate: [UsernameGuard] },
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
