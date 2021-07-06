import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(private afs: AngularFirestore) { }

  /* Unique Functions */

  isNewUnique(newUnique: string, oldUnique: string): boolean {
    return newUnique !== oldUnique;
  }

  checkUnique(col: string, doc: string, uniqueCol = '_uniques'): AngularFirestoreDocument<any> {
    return this.afs.doc(`${uniqueCol}/${col}/${doc}`);
  }

  /* Tag Functions */

  getAllTags(col = 'tags', allDoc = '_all'): Observable<any> {
    return this.afs.collection(col,
      ref => ref.where(firebase.firestore.FieldPath.documentId(), '!=', allDoc)
    ).valueChanges({ idField: 'name' });
  }

  getAllTagsDoc(col = 'tags', allDoc = '_all'): Observable<any> {
    return this.afs.collection(col).doc(allDoc).snapshotChanges();
  }

}
