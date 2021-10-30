import { Inject, Injectable } from '@angular/core';
import { DbService } from './db.service';

// Firebase Auth
import { Auth } from '@angular/fire/auth';
import { FbAuthService } from '../firebase/fb-auth.service';
import { DOCUMENT } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class AuthService extends FbAuthService {
  constructor(
    auth: Auth,
    db: DbService,
    @Inject(DOCUMENT) doc: Document
  ) {
    super(auth, db, doc);
  }
}
