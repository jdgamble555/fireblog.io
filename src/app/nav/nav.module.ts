import { NgModule } from '@angular/core';
import { HeaderComponent } from '../nav/header/header.component';
import { FooterComponent } from '../nav/footer/footer.component';
import { LeftnavComponent } from '../nav/leftnav/leftnav.component';
import { RightnavComponent } from '../nav/rightnav/rightnav.component';
import { NavComponent } from '../nav/nav.component';
import { NavService } from '../nav/nav.service';
import { CoreModule } from '../core/core.module';
import { TagModule } from '../tag/tag.module';
import { BoldTermPipe } from '../shared/bold-term.pipe';

const components = [
  NavComponent,
  HeaderComponent,
  FooterComponent,
  LeftnavComponent,
  RightnavComponent
];

const modules = [
  CoreModule,
  TagModule
];

@NgModule({
  declarations: [
    ...components,
    BoldTermPipe
  ],
  providers: [NavService],
  imports: [...modules],
  exports: [
    ...components,
    ...modules
  ]
})
export class NavModule { }
