import { NgModule } from '@angular/core';
import { CoreModule } from '@core/core.module';
import { HeartComponent } from './heart/heart.component';
import { SaveComponent } from './save/save.component';
import { UrlSanitizerPipe } from './url-sanitizer.pipe';

const pipes = [
  UrlSanitizerPipe
];

const modules = [
  CoreModule
];

const components = [
  HeartComponent,
  SaveComponent
];

@NgModule({
  declarations: [
    ...components,
    ...pipes
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...components,
    ...pipes
  ]
})
export class SharedModule { }
