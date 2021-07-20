import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { PostComponent } from './post/post.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'reset', component: AuthComponent },
  { path: 'post/:id', component: PostComponent },
  { path: 'post/:id/:slug', component: PostComponent },
  { path: 'new', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule) },
  { path: 'edit/:id', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule) },
  { path: 'settings', loadChildren: () => import('./auth/auth-settings/auth-settings.module').then(m => m.AuthSettingsModule) },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
