import { Pipe, PipeTransform } from '@angular/core';
import { FirestoreService } from './firestore/firestore.service';
import { Observable } from 'rxjs';

@Pipe({
  name: 'doc',
  pure: false
})
export class DocPipe implements PipeTransform {

  constructor(private db: FirestoreService) { }

  transform(value: any): Observable<any> {

    return this.db.doc$(value.path);
  }
}
