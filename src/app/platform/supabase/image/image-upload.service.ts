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
import { blobToData, randomID, scaleImage } from '@shared/image-tools/image-tools';
import { Observable } from 'rxjs';
import { ImageModule } from './image.module';

interface Preview {
  blob: Blob;
  filename: string;
}

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
  async getURL(gs: string): Promise<string | undefined> {
    try {
      return await getDownloadURL(
        ref(this.storage, gs)
      );
    } catch (e: any) {
      // catch no image file
      if (e.code === 'storage/unauthorized') {
        return;
      }
    }
    return;
  }

  /**
 * Gets an image blob before upload
 * @param event - file event
 * @returns - string blob of image
 */
  async previewImage(event: Event): Promise<Preview | undefined> {

    // add event to image service
    const target = event.target as HTMLInputElement;

    if (target.files?.length) {

      // view file before upload
      const file = target.files[0];
      const filename = file.name;

      // get image preview
      const image = await blobToData(file);

      // return resized version
      const blob = await scaleImage(this.document, image, undefined, 800, 418);
      return { filename, blob };
    }
    return;
  }

  /**
   * Delete Image from Storage Bucket
   * @param url - url of bucket item to delete
   * @returns - a resolved promise that image was deleted
   */
  async deleteImage(url: string): Promise<void> {
    try {
      // delete image
      return await deleteObject(
        ref(this.storage, url)
      );
    } catch (e: any) {
      if (e.code === 'storage/invalid-argument') {
        // don't delete anything if no previous image
        return;
      } else {
        throw e;
      }
    }
  }

  /**
   * Uploads Image to Storage Bucket
   * @param folder - folder containing image
   * @param file - file blob
   * @param name - image file name, default random name
   */
  async uploadImage(folder: string, file: File | null, name = randomID()): Promise<string> {

    const ext = file!.name.split('.').pop();
    const path = `${folder}/${name}.${ext}`;

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
        return await getDownloadURL(storageRef);
      }
    } else {
      throw { code: 'invalid-file' };
    }
  }
}
