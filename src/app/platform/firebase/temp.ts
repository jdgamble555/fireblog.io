import { collection, DocumentReference, limit, query, where } from "firebase/firestore";
import { collectionData, docData } from "rxfire/firestore";
import { combineLatest, map, Observable, of, switchMap } from "rxjs";


  // getDocJoin
  // getDocsJoin
  // docJoin
  // collectionJoin
  
  
  export function docJoin<T>(docRef: DocumentReference<T>, fields: string[] = [], opts?: any): Observable<T> {
    return docData(docRef).pipe(
      switchMap((_doc: any) => {
        const joins: Observable<any>[] = [];
  
        // go through input fields
        if (fields.length > 0) {
          fields.map(f => {
  
            // left join
            if (f.includes('.')) {
              const [col, _f] = f.split('.');
              const m = opts && opts[f] ? opts[f] : [limit(1)];
              joins.push(
                collectionData(
                  query(
                    collection(docRef.firestore, col),
                    where(_f, '==', docRef),
                    ...m
                  )
                )
              );
            } else {
  
              // inner join
              const n = opts && opts[f] ? opts[f] : { idField: 'id' };
              joins.push(
                docData(_doc[f], n)
              );
            }
          });
  
          // go through all fields
        } else {
  
          // all document reference fields
          Object.keys(_doc).filter(k => {
            const p = _doc[k] instanceof DocumentReference;
            if (p) {
              const n = opts && opts[k] ? opts[k] : { idField: 'id' };
              if (p) {
                fields.push(k);
              }
              joins.push(
                docData(_doc[k], n)
              );
            }
          })
        }
  
        // combine observable results
        return combineLatest(joins)
          .pipe(map(x => {
            fields.map((f, i) => {
              if (f.includes('.')) {
                const [col, _f] = f.split('.');
                _doc[col] = x[i];
              } else {
                _doc[f] = x[i];
              }
            });
            return _doc;
          }));
      })
    );
  }