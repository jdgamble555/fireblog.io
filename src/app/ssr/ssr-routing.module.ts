import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SsrComponent } from './ssr.component';

const routes: Routes = [
  { path: '', component: SsrComponent },

  // auth
  { path: 'login', component: SsrComponent },
  { path: 'register', component: SsrComponent },
  { path: 'reset', component: SsrComponent },
  { path: 'verify', component: SsrComponent },

  // posts
  { path: 'post/:id', component: SsrComponent },
  { path: 'post/:id/:slug', component: SsrComponent },
  { path: 't/:tag', component: SsrComponent },
  { path: 'user/:uid', component: SsrComponent },

  { path: '**', component: SsrComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
})],
  exports: [RouterModule]
})
export class SsrRoutingModule { }
