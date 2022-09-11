import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LeftnavComponent } from './leftnav/leftnav.component';
import { RightnavComponent } from './rightnav/rightnav.component';
import { NavComponent } from './nav.component';
import { TagListComponent } from '@post/tag-list/tag-list.component';
import { CoreModule } from '@core/core.module';


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
