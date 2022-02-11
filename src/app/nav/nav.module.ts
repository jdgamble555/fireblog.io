import { NgModule } from '@angular/core';
import { HeaderComponent } from '../nav/header/header.component';
import { FooterComponent } from '../nav/footer/footer.component';
import { LeftnavComponent } from '../nav/leftnav/leftnav.component';
import { RightnavComponent } from '../nav/rightnav/rightnav.component';

import { NavComponent } from '../nav/nav.component';
import { CoreModule } from '../core/core.module';
import { TagListComponent } from '../post/tag-list/tag-list.component';

const components = [
  NavComponent,
  HeaderComponent,
  FooterComponent,
  LeftnavComponent,
  RightnavComponent,
  TagListComponent
];

const modules = [
  CoreModule
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...components,
    ...modules
  ]
})
export class NavModule { }
