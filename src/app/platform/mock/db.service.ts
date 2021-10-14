import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

// Firestore imports
import { Firestore } from '@angular/fire/firestore';
import { FbDbService } from '../firebase/fb-db.service';

@Injectable({
  providedIn: 'root'
})
export class DbService extends FbDbService {
  constructor(
    afs: Firestore,
    @Inject(DOCUMENT) document: Document
  ) {
    super(afs, document);
  }
}
