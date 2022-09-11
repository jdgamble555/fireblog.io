import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DbModule } from '@db/db.module';
import { environment } from '@env/environment';
import { NavModule } from '@nav/nav.module';
import { AuthComponent } from '@auth/auth.component';
import { PostResolver } from '@post/post.resolver';
import { PostListModule } from '@post/post-list/post-list.module';
import { PostModule } from '@post/post.module';
import { MarkdownModule } from 'ngx-markdown';


@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    DbModule,
    PostModule,
    PostListModule,
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
  providers: [PostResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }

