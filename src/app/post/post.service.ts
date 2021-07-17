import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { combineLatest, defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from '../auth/user.model';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private afs: AngularFirestore) { }

  getPosts(): Observable<Post[]> {
    let data: Post[];
    return this.afs.collection<Post>('posts').valueChanges({ idField: 'id' }).pipe(
      switchMap((r: Post[]) => {
        data = r;
        const docs = r.map(
          (d: Post) => this.afs.doc<User>(`users/${d.authorId}`).valueChanges()
        );
        return combineLatest(docs).pipe(
          map((arr: any) => arr.reduce((acc: any, cur: any) => [acc].concat(cur)))
        );
      }),
      map((d: User[]) => {
        let i = 0;
        return d.map(
          (doc: User) => {
            const t = { ...data[i], author: doc };
            ++i;
            return t;
          }
        );
      })
    );
  }

  minutesToRead(data: string): string {
    const wordCount = data.trim().split(/\s+/g).length;
    return (wordCount / 100 + 1).toFixed(0);
  }

}
