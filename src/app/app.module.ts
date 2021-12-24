import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { HomeComponent } from './home/home.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { MarkdownModule } from 'ngx-markdown';
import { PostComponent } from './post/post.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { FirebaseModule } from './platform/firebase/firebase.module';
import { NavModule } from './nav/nav.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

// have to use old version of Firebase Analytics
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
import { AngularFireModule } from '@angular/fire/compat';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PostComponent,
    PostListComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AppRoutingModule,
    FirebaseModule,
    NgxSkeletonLoaderModule,
    NavModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserAnimationsModule,
    CoreModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

