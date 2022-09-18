import { Injectable } from '@angular/core';
import { DbModule } from '@db/db.module';
import { environment } from '@env/environment';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { from, of, Observable, Subscriber, switchMap } from 'rxjs';

export interface sb_User {
  id: string;
  created_at: Date;
  updated_at?: Date;
  photo_url?: string;
  username?: string;
  display_name?: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: DbModule
})
export class SupabaseService {

  public supabase: SupabaseClient;

  constructor() {

    // init supabase
    this.supabase = createClient(
      environment.supabase_url,
      environment.supabase_key
    );
  }

  authState(): Observable<User | null> {
    return new Observable((subscriber: Subscriber<User | null>) => {
      this.supabase.auth.getSession().then(session =>
        subscriber.next(session.data.session?.user)
      );
      const auth = this.supabase.auth.onAuthStateChange(async ({ }, session) => {
        subscriber.next(session?.user);
      });
      return auth.data.subscription.unsubscribe;
    });
  }

  subWhere<T>(table: string, field: string, value: string): Observable<T> {
    return new Observable((subscriber: Subscriber<T>) => {
      this.supabase.from(table).select('*').eq(field, value).single().then(payload => {
        subscriber.next(payload.data);
      });
      const filter = `${field}=eq.${value}`;
      return this.supabase.channel('public:' + `${table}:${filter}`).on('postgres_changes', {
        event: '*', schema: 'public', table, filter
      }, (payload: { new: T | undefined; }) => {
        subscriber.next(payload.new)
      })
    });
  }

  /*async upload(folder: string, path: string, file: File | null) {
    const url = `${environment.supabase_url}/storage/v1/object/${folder}/${path}`;

    // headers
    const authBearer = this.supabase.auth.session()?.access_token ?? environment.supabase_key;
    const headers: any = {};
    headers['apikey'] = environment.supabase_key;
    headers['Authorization'] = `Bearer ${authBearer}`;

    // progress, error
    let pct: number | null = null;
    let error: Error | null = null;

    const req = new XMLHttpRequest();

    await new Promise<void>((res: any, rej: any) => {
      req.upload.onprogress = ev => {
        pct = (ev.loaded / ev.total) * 100;
        console.log(`Upload progress = ${ev.loaded} / ${ev.total} = ${pct}`);
      };

      // transfer complete
      req.upload.onload = () => res(null);

      // You might want to also listen to onabort, onerror, ontimeout
      req.open("POST", url);
      for (const [key, value] of Object.entries<any>(headers)) {
        req.setRequestHeader(key, value);
      }
      req.send(file);
      req.onerror = error => rej(error);
    }).catch(e => error = e);

    return { error, progress: pct };
  }*/
}

/*
  private _getAuthHeaders(): GenericObject {
    const headers: GenericObject = { ...this.headers }
    const authBearer = this.auth.session()?.access_token ?? this.supabaseKey
    headers['apikey'] = this.supabaseKey
    headers['Authorization'] = headers['Authorization'] || `Bearer ${authBearer}`
    return headers
  }
  */
