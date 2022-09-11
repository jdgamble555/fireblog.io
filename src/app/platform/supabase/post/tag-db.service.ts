import { Injectable } from '@angular/core';
import { DbModule } from '@db/db.module';
import { Tag } from '@post/post.model';
import { map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: DbModule
})
export class TagDbService {

  constructor() { }

  async getTags(): Promise<{ data: Tag[] | null, error: string | null }> {
    let error = null;
    let data = null;
    return { data, error };
  }

  /**
   * Get all tags and their count
   * @returns tags
   */
  private subTags(): Observable<Tag[]> {
    return of();
  }

  /**
   * Get tag count from tag doc
   * @param t - tag
   * @returns
   */
  subTagTotal(t: string): Observable<string> {
    return of('');
  }
}
