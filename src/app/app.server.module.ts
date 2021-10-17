import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';


import { SsrComponent } from './ssr/ssr.component';
import { SsrModule } from './ssr/ssr.module';

@NgModule({
  imports: [
    SsrModule,
    ServerModule
  ],
  bootstrap: [SsrComponent]
})
export class AppServerModule {}
