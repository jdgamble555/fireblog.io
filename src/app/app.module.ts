import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DbModule } from '@db/db.module';
import { environment } from '@env/environment';
import { NavModule } from '@nav/nav.module';
import { PostModule } from '@post/post.module';
import { ClipboardOptions, MarkdownModule } from 'ngx-markdown';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    DbModule,
    PostModule,
    NavModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

