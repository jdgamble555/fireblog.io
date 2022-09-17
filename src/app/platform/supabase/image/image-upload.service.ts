import { Injectable } from '@angular/core';
import { randomID } from '@shared/image-tools/image-tools';
import { Observable } from 'rxjs';
import { SupabaseService } from '../supabase.service';
import { ImageModule } from './image.module';


@Injectable({
  providedIn: ImageModule
})
export class ImageUploadService {

  // image type
  type = 'image/jpeg';

  // use for progress bar
  uploadPercent: Observable<number> | any = null;

  // use for spinners
  uploadingImage = false;

  constructor(
    private sb: SupabaseService
  ) { }

  /**
   * Returns image url from google URL
   * @param gs - google url
   * @returns image url
   */
  async getURL(gs: string): Promise<{ error: any, data: string | null }> {
    const { data, error } = this.sb.supabase.storage.from('photos').getPublicUrl(gs.substring(gs.indexOf('/') + 1));
    return { error, data: data?.publicURL || null };
  }

  /**
   * Delete Image from Storage Bucket
   * @param url - url of bucket item to delete
   * @returns - a resolved promise that image was deleted
   */
  async deleteImage(url: string): Promise<{ error: any }> {

    const { error } = await this.sb.supabase.storage.from('photos').remove([url]);
    return { error };
  }

  /**
   * Uploads Image to Storage Bucket
   * @param folder - folder containing image
   * @param file - file blob
   * @param name - image file name, default random name
   */
  async uploadImage(folder: string, file: File | null, name = randomID()): Promise<{ data: any | null, error: any }> {

    folder = folder.replace('_', '-');
    const ext = file!.name.split('.').pop();
    const path = `${folder}/${name}.${ext}`;
    let error = null;
    let data = null;
    const { error: _e } = await this.deleteImage(path);
    if (_e) {
      console.error(_e);
    }
    //let progress = null;
    try {
      if (file) {
        if (file!.type.split('/')[0] !== 'image') {
          throw { code: 'image/file-type' };
        }
        else {
          // this.uploadPercent = percentage(task);
          // todo - add progress
          ({ error, data } = await this.sb.supabase.storage.from('photos').upload(path, file));
        }
      } else {
        throw { code: 'invalid-file' };
      }
    } catch (e: any) {
      error = e;
    }
    let url = null;
    if (data?.Key) {

      ({ error, data: url } = await this.getURL(data.Key));
      url = url + '?lastmod=' + Math.random();
    }
    return { data: url, error };
  }
}

