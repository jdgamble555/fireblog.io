import { Injectable } from '@angular/core';

// Firestore imports
import { Firestore } from '@angular/fire/firestore';
import { FbDbService } from '../firebase/fb-db.service';
import { FirestoreToolsService } from '../firebase/firestore-tools.service';

@Injectable({
  providedIn: 'root'
})
export class DbService extends FbDbService {
  constructor(afs: Firestore, tools: FirestoreToolsService) {
    super(afs, tools);
  }
}
