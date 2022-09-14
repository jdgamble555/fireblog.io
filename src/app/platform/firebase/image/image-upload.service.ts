import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import {
  Storage,
  ref,
  deleteObject,
  uploadBytesResumable,
  percentage,
  getDownloadURL
} from '@angular/fire/storage';
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
    private storage: Storage,
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
    try {
      data = await getDownloadURL(
        ref(this.storage, gs)
      );
    } catch (e: any) {
      // catch no image file
      if (e.code === 'storage/unauthorized') {
        // do nothing
      }
      error = e;
    }
    return { error, data };
  }

  /**
   * Delete Image from Storage Bucket
   * @param url - url of bucket item to delete
   * @returns - a resolved promise that image was deleted
   */
  async deleteImage(url: string): Promise<{ error: any }> {
    let error = null;
    // make sure image exists
    const { error: _e } = await this.getURL(url);
    if (_e) {
      if (_e.code !== 'storage/object-not-found') {
        error = _e;
      }
    } else {
      try {
        // delete image
        await deleteObject(
          ref(this.storage, url)
        );
      } catch (e: any) {
        if (e.code === 'storage/invalid-argument') {
          // don't delete anything if no previous image
        } else {
          console.error(e);
          error = e;
        }
      }
    }
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
    try {
      if (file) {
        if (file!.type.split('/')[0] !== 'image') {
          throw { code: 'image/file-type' };
        }
        else {
          const storageRef = ref(this.storage, path);
          const task = uploadBytesResumable(storageRef, file);
          this.uploadPercent = percentage(task);

          // upload image
          this.uploadingImage = true;
          await task;
          this.uploadingImage = false;
          data = await getDownloadURL(storageRef);
        }
      } else {
        throw { code: 'invalid-file' };
      }
    } catch (e: any) {
      error = e;
    }
    return { data, error };
  }
}
