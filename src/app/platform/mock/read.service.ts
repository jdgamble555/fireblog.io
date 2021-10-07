import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

// Firestore imports
import { Firestore } from '@angular/fire/firestore';
import { FbReadService } from '../firebase/fb-read.service';
import { FirebaseModule } from '../firebase/firebase.module';


@Injectable({
  providedIn: 'root'
})
export class ReadService extends FbReadService {
  constructor(afs: Firestore, auth: AuthService, fm: FirebaseModule) {
    super(afs, auth, fm);
  }
}
