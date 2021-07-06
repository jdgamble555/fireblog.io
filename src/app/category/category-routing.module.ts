import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, EmailGuard } from '../auth/auth.guard';
import { CategoryComponent } from './category.component';
import { CategoryFormComponent } from './category-form/category-form.component';


const routes: Routes = [
  { path: '', component: CategoryComponent },
  { path: 'new', component: CategoryFormComponent },
  { path: 'edit/:id', component: CategoryFormComponent, canActivate: [AuthGuard, EmailGuard] },
  {
    path: 'category', redirectTo: '',
    children: [
      {
        path: '**',
        component: CategoryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }
