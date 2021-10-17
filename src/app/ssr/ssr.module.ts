import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SsrComponent } from './ssr.component';
import { SeoService } from '../shared/seo/seo.service';
import { SsrRoutingModule } from './ssr-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { environment } from 'src/environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';



@NgModule({
  declarations: [SsrComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),

    // Only import necessary database platforms...
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),

    CommonModule,
    SsrRoutingModule,
    MatToolbarModule
  ],
  providers: [SeoService],
  bootstrap: [SsrComponent]
})
export class SsrModule { }
