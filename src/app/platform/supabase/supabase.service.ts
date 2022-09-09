import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Observable, Subscriber } from 'rxjs';

export interface sb_User {
  id: string;
  created_at: Date;
  updated_at?: Date;
  photo_url?: string;
  username?: string;
  display_name?: string;
}

@Injectable({
  providedIn: 'root'
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
      subscriber.next(this.supabase.auth.user());
      const auth = this.supabase.auth.onAuthStateChange(async ({ }, session) => {
        subscriber.next(session?.user);
      });
      return auth.data?.unsubscribe;
    });
  }

  subWhere(col: string, field: string, value: string): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      this.supabase.from(col).select('*').eq(field, value).single().then((payload: any) => {
        subscriber.next(payload.data);
      });
      return this.supabase.from(`${col}:${field}=eq.${value}`).on('*', (payload: any) => {
        subscriber.next(payload.new);
      }).subscribe();
    });
  }

}
