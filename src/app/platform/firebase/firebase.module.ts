import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService
} from '@angular/fire/analytics';
import { StateService } from 'src/app/core/state.service';
import { TransferState } from '@angular/platform-browser';

const FirebaseEVN = (state: StateService): any => {
  let process: any;
  if (process?.env?.firebase) {
    if (typeof window === 'undefined') {
      state.saveState('fb', process.env.firebase);
    } else if (state.hasState('fb')) {
      return state.getState('fb');
    }
  }
  return environment?.firebase;
};

@NgModule({
  declarations: [],
  imports: [
    provideAnalytics(() => getAnalytics()),
    provideFirebaseApp(() => initializeApp(FirebaseEVN(new StateService(new TransferState)))),
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
