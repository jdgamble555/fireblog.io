import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { randomID } from '@shared/image-tools/image-tools';
import { Observable } from 'rxjs';
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
    @Inject(DOCUMENT) private document: Document
  ) { }

  /**
   * Returns image url from google URL
   * @param gs - google url
   * @returns image url
   */
  async getURL(gs: string): Promise<{ error: any, data: string | null }> {
    let error = null;
    let data = null;
    return { error, data };
  }

  async objectExists(url: string): Promise<{ error: any, data: boolean | null }> {
    // make sure image exists
    let error = null;
    let data = null;
    return { data, error };
  }

  /**
   * Delete Image from Storage Bucket
   * @param url - url of bucket item to delete
   * @returns - a resolved promise that image was deleted
   */
  async deleteImage(url: string): Promise<{ error: any }> {
    let error = null;
    return { error };
  }

  /**
   * Uploads Image to Storage Bucket
   * @param folder - folder containing image
   * @param file - file blob
   * @param name - image file name, default random name
   */
  async uploadImage(folder: string, file: File | null, name = randomID()): Promise<{ data: string | null, error: any }> {

    const ext = file!.name.split('.').pop();
    const path = `${folder}/${name}.${ext}`;

    let error = null;
    let data = null;
    return { data, error };
  }
}
