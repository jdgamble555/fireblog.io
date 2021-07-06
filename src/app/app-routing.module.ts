import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'reset', component: AuthComponent },
  { path: 'new', loadChildren: () => import('./post/post-form/post-form.module').then(m => m.PostFormModule) },
  { path: 'blog', loadChildren: () => import('./post/post.module').then(m => m.PostModule) },
  { path: 'directory', loadChildren: () => import('./category/category.module').then(m => m.CategoryModule) },
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
