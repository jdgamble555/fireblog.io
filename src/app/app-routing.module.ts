import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { LoginGuard, EmailGuard, NotLoginGuard } from './auth/auth.guard';
import { HomeComponent } from './home/home.component';
import { PostComponent } from './post/post.component';

const routes: Routes = [
  { path: '', component: HomeComponent },

  // auth
  { path: 'login', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'register', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'reset', component: AuthComponent, canActivate: [NotLoginGuard] },
  { path: 'verify', component: AuthComponent, canActivate: [LoginGuard] },

  // posts
  { path: 'post/:id', component: PostComponent },
  { path: 'post/:id/:slug', component: PostComponent },

  // logged in
  { path: 'new', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [EmailGuard, LoginGuard] },
  { path: 'edit/:id', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule), canActivate: [EmailGuard, LoginGuard] },
  { path: 'settings', loadChildren: () => import('./auth/auth-settings/auth-settings.module').then(m => m.AuthSettingsModule), canActivate: [LoginGuard] },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
