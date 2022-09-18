import { Injectable } from '@angular/core';
import { DbModule } from '@db/db.module';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: DbModule
})
export class ActionDbService {

  constructor() { }

  async getAction(id: string, uid: string, action: string): Promise<{ error: any, data: boolean | null }> {
    let error = null;
    let data = null;
    return { data, error };
  }

  async getActionExists(postId: string, userId: string, action: string): Promise<{ data: boolean | null, error: any }> {
    let error = null;
    let data = null;
    return { data, error };
  }

  async actionPost(postId: string, userId: string, action: string): Promise<{ error: any }> {
    let error = null;
    return { error };
  }

  async unActionPost(postId: string, userId: string, action: string): Promise<{ error: any }> {
    let error = null;
    return { error };
  }

}
