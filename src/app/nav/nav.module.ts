import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LeftnavComponent } from './leftnav/leftnav.component';
import { RightnavComponent } from './rightnav/rightnav.component';
import { NavComponent } from './nav.component';
import { CoreModule } from '@core/core.module';
import { LeftnavService } from './leftnav/leftnav.service';
import { TagListService } from '@post/tag-list/tag-list.service';
import { TagListComponent } from '@post/tag-list/tag-list.component';


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


// preload tags and post count
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
  ],
  providers: [{
    provide: APP_INITIALIZER,
    deps: [LeftnavService],
    useFactory: (lns: LeftnavService) => async () => await lns.preloadPostCount(),
    multi: true
  },
  {
    provide: APP_INITIALIZER,
    deps: [TagListService],
    useFactory: (tls: TagListService) => async () => await tls.preloadTags(),
    multi: true
  }]
})
export class NavModule { }
