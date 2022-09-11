import { Injectable } from '@angular/core';
import { DbModule } from '@db/db.module';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: DbModule
})
export class ActionDbService {

  constructor() { }

  async getAction(id: string, uid: string, action: string): Promise<{ error: string | null, data: boolean | null }> {
    let error = null;
    let data = null;
    return { data, error };
  }

  async getActionExists(postId: string, userId: string, action: string): Promise<{ data: boolean | null, error: string | null }> {
    let error = null;
    let data = null;
    return { data, error };
  }

  async actionPost(postId: string, userId: string, action: string): Promise<{ error: string | null }> {
    let error = null;
    return { error };
  }

  async unActionPost(postId: string, userId: string, action: string): Promise<{ error: string | null }> {
    let error = null;
    return { error };
  }

  subAction(id: string, uid: string, action: string): Observable<boolean> {
    return of();
  }
}
