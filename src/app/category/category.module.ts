import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryRoutingModule } from './category-routing.module';
import { CategoryComponent } from './category.component';
import { CategoryFormComponent } from './category-form/category-form.component';
import { CoreModule } from '../core/core.module';
import { PostModule } from '../post/post.module';

const components = [
  CategoryComponent,
  CategoryFormComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    CoreModule,
    CategoryRoutingModule,
    PostModule
  ],
  exports: [
    ...components
  ]
})
export class CategoryModule { }
