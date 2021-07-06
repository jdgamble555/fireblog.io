import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
  DocumentChangeAction,
  Action,
  DocumentSnapshotDoesNotExist,
  DocumentSnapshotExists,
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable, defer, of, combineLatest } from 'rxjs';
import { map, tap, take, switchMap, catchError } from 'rxjs/operators';

export interface Condition {
  fieldPath: string | firebase.firestore.FieldPath;
  opStr: firebase.firestore.WhereFilterOp;
  value: any;
}

export interface OrderBy {
  fieldPath: string | firebase.firestore.FieldPath;
  directionStr?: 'desc' | 'asc' | undefined;
}

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;
@Injectable({
  providedIn: 'root',
})
export class FirestoreService {

  constructor(private afs: AngularFirestore) { }

  // Document references from a string or a reference
  col<T>(ref: CollectionPredicate<T>, queryFn?: any): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref;
  }
  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref;
  }

  // Get document along with values from observable
  doc$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref)
      .snapshotChanges()
      .pipe(
        map((doc: Action<DocumentSnapshotDoesNotExist | DocumentSnapshotExists<T>>) => {
          return doc.payload.data() as T;
        }),
      );
  }

  // Get set of documents along with values from observable
  col$<T>(ref: CollectionPredicate<T>, queryFn?: any): Observable<T[]> {
    return this.col(ref, queryFn)
      .snapshotChanges()
      .pipe(
        map((docs: DocumentChangeAction<T>[]) => {
          return docs.map((a: DocumentChangeAction<T>) => a.payload.doc.data()) as T[];
        }),
      );
  }

  // Get timestamp from firestore
  get timestamp(): firebase.firestore.FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  // Set a document from document reference with updated timestamps
  set<T>(ref: DocPredicate<T>, data: any): Promise<void> {
    const timestamp = this.timestamp;
    return this.doc(ref).set({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp,
    });
  }

  // Update document with timestamp
  update<T>(ref: DocPredicate<T>, data: any): Promise<void> {
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp,
    });
  }

  // Delete document from firestore
  delete<T>(ref: DocPredicate<T>): Promise<void> {
    return this.doc(ref).delete();
  }

  // Add a document from a collection reference
  add<T>(ref: CollectionPredicate<T>, data: any): Promise<firebase.firestore.DocumentReference> {
    const timestamp = this.timestamp;
    return this.col(ref).add({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp,
    });
  }

  // Upserts a docment from a document reference
  async upsert<T>(ref: DocPredicate<T>, data: any): Promise<void> {
    const doc = this.doc(ref)
      .snapshotChanges()
      .pipe(take(1))
      .toPromise();
    return doc.then((snap: Action<DocumentSnapshotDoesNotExist | DocumentSnapshotExists<T>>) => {
      return snap.payload.exists ? this.update(ref, data) : this.set(ref, data);
    });
  }

  // Get all documents from a collection reference with Ids
  colWithIds$<T>(ref: CollectionPredicate<T>, queryFn?: any): Observable<any[]> {
    return this.col(ref, queryFn)
      .snapshotChanges()
      .pipe(
        map((actions: DocumentChangeAction<T>[]) => {

          return actions.map((a: DocumentChangeAction<T>) => {
            const data = a.payload.doc.data() as T;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        }),
      );
  }

  // Logs the time it takes to get a document
  inspectDoc(ref: DocPredicate<any>): void {
    const tick = new Date().getTime();
    this.doc(ref)
      .snapshotChanges()
      .pipe(
        take(1),
        tap((d: Action<DocumentSnapshotDoesNotExist | DocumentSnapshotExists<any>>) => {
          const tock = new Date().getTime() - tick;
          console.log(`Loaded Document in ${tock}ms`, d);
        }),
      )
      .subscribe();
  }

  // Logs the time it takes to load a collection
  inspectCol(ref: CollectionPredicate<any>): void {
    const tick = new Date().getTime();
    this.col(ref)
      .snapshotChanges()
      .pipe(
        take(1),
        tap((c: DocumentChangeAction<any>[]) => {
          const tock = new Date().getTime() - tick;
          console.log(`Loaded Collection in ${tock}ms`, c);
        }),
      )
      .subscribe();
  }

  // Returns a geopoint firestore object
  geopoint(lat: number, lng: number): firebase.firestore.GeoPoint {
    return new firebase.firestore.GeoPoint(lat, lng);
  }

  // Get set of documents from a query
  query(ref: CollectionPredicate<any>, myQuery: any): any {
    return this.col(ref, (queryFn: any) => {
      if (myQuery.page !== 1) {
        myQuery.limit = myQuery.page * myQuery.limit;
      }
      return this.createQuery(queryFn, myQuery);
    })
      .valueChanges({ idField: 'id' })
      .pipe(
        map((data: any) => {
          let show: number = myQuery.limit / myQuery.page;
          // if less results than the limit
          if (data.length < myQuery.limit) {
            show = show - (myQuery.limit - data.length);
          }
          // return array of page
          return data.slice(-show);
        }),
        catchError((e: any) => {
          console.log(e);
          return of();
        })
      );
  }

  // Create a firestore query and return it
  createQuery(queryFn: any, myQuery: any): firebase.firestore.Query<firebase.firestore.DocumentData> {
    let query: firebase.firestore.CollectionReference | firebase.firestore.Query = queryFn;
    if (myQuery.conditions) {
      myQuery.conditions.forEach((c: Condition) => {
        query = query.where(c.fieldPath, c.opStr, c.value);
      });
    }
    if (myQuery.orderBy) {
      query = query.orderBy(myQuery.orderBy.fieldPath, myQuery.orderBy?.directionStr);
    }
    if (myQuery.limit) { query = query.limit(myQuery.limit); }
    if (myQuery.startAfter) { query = query.startAfter(myQuery.startAfter); }
    if (myQuery.startAt) { query = query.startAt(myQuery.startAt); }
    if (myQuery.endAt) { query = query.endAt(myQuery.endAt); }
    if (myQuery.endBefore) { query = query.endBefore(myQuery.endBefore); }

    return query;
  }
  /**
   * @param col - collection
   * @param q - collection query
   * @param fk - foreign key
   * @param fCollection - foreign collection
   * @param pk - primary key in foreign collection
   */
  leftJoin(col: string, q: any, fk: string, fCollection: string, pk: string, limit = 100, debug = false): Observable<any> {
    const results = this.query(col, q);
    return results.pipe(
      this.leftJoin$(fk, fCollection, pk, q.orderBy.fieldPath, q.orderBy.directionStr, limit, debug)
    );
  }
  /**
   * @param fk - foreign key
   * @param fCollection - foreign collection
   * @param pk - primary key of foreign collection
   * @param orderField - field to sort by
   * @param orderBy - desc or asc
   * @param limit - limit of docs to grab
   * @param debug - true / false print total docs read
   */
  leftJoin$(
    fk: string,
    fCollection: string,
    pk: string | firebase.firestore.FieldPath,
    orderField = 'id',
    orderBy = 'asc',
    limit = 100,
    debug = false
  ): any {
    // TODO - If 'id' field is different name

    return (source: any) =>
      defer(() => {
        // Operator state
        let collectionData: any;

        // Track total num of joined doc reads
        let totalJoins = 0;

        return source.pipe(
          switchMap(data => {
            // Clear mapping on each emitted val ;
            // Save the parent data state
            collectionData = data as any[];

            const reads$: any[] = [];
            for (const doc of collectionData) {

              // Push doc read to Array
              if (doc[fk]) {
                // if an id field
                if (pk === 'id') { pk = firebase.firestore.FieldPath.documentId(); }
                // Perform query on join key, with optional limit
                const q = (ref: any) => ref.where(pk, '==', doc[fk]).limit(limit);
                reads$.push(this.afs.collection(fCollection, q).valueChanges({ idField: 'id' }));
              } else {
                reads$.push(of([]));
              }
            }
            return combineLatest(reads$);
          }),
          map((joins: any) => {
            return collectionData.map((v: any, i: any) => {
              totalJoins += joins[i]?.length;
              return joins[i][0];
            });
          }),
          map((s: any) => {
            function compareDate(a: any, b: any): number {
              let comparison = 0;
              if (a[orderField] > b[orderField]) {
                comparison = 1;
              } else if (a[orderField] < b[orderField]) {
                comparison = -1;
              }
              if (orderBy === 'desc') {
                return comparison * -1;
              }
              return comparison;
            }
            return s.sort(compareDate);
          }),
          tap(final => {
            if (debug) {
              console.log(
                `Queried ${(final as any).length}, Joined ${totalJoins} docs`
              );
              totalJoins = 0;
            }
          })
        );
      });
  }
}
