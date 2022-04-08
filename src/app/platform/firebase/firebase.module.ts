import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';
//import { environment } from 'src/environments/environment';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService
} from '@angular/fire/analytics';


const FirebaseEVN = () => {
  let process: any;
  //if (process?.env?.VUE_APP_FIREBASE) {
    return JSON.parse(process.env.VUE_APP_FIREBASE);
  //} else {
  //  return environment.firebase;
  //}
};

@NgModule({
  declarations: [],
  imports: [
    provideAnalytics(() => getAnalytics()),
    provideFirebaseApp(() => initializeApp(FirebaseEVN())
    ),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService
  ],
})
export class FirebaseModule { }
