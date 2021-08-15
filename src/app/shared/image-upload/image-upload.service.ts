import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { ImageUploadModule } from './image-upload.module';

@Injectable({
  providedIn: ImageUploadModule
})
export class ImageUploadService {

  uploadPercent: Observable<number> | any = null;
  showPercent = false;

  constructor(
    private storage: AngularFireStorage,
    @Inject(DOCUMENT) private document: Document
  ) { }

  /**
   *
   * Canvas tools to resize image
   *
   */

  async blobToData(blob: Blob): Promise<string> {
    return new Promise((res: any) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  drawImageScaled(img: HTMLImageElement, ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    const hRatio = canvas.width / img.width;
    const vRatio = canvas.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (canvas.width - img.width * ratio) / 2;
    const centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
  }

  async compressImage(src: any, newX: number, newY: number): Promise<Blob> {
    return new Promise((res: any, rej: any) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = this.document.createElement('canvas');
        elem.width = newX;
        elem.height = newY;
        const ctx = elem.getContext('2d') as CanvasRenderingContext2D;
        this.drawImageScaled(img, ctx);
        ctx.canvas.toBlob(res, 'image/png');
      }
      img.onerror = error => rej(error);
    });
  }

  /**
 * Gets an image blob before upload
 * @param event - file event
 * @returns - string blob of image
 */
  async previewImage(event: Event): Promise<Blob | string> {

    // add event to image service
    const target = event.target as HTMLInputElement;

    if (target.files?.length) {
      // view file before upload
      const file = target.files[0];

      // get image preview
      const image = await this.blobToData(file);

      // return resized version
      return await this.compressImage(image, 800, 418);
    }
    return '';
  }

  /**
   * Delete Image from Storage Bucket
   * @param url - url of bucket item to delete
   * @returns - a resolved promise that image was deleted
   */
  async deleteImage(url: string): Promise<void> {

    try {
      // delete image
      return await this.storage.storage.refFromURL(url).delete();
    } catch (e: any) {
      if (e.code === 'storage/invalid-argument') {
        // don't delete anything if no previous image
        return;
      }
    }
    return;
  }

  /**
   * Uploads Image to Storage Bucket
   * @param folder - folder containing image
   * @param name - file name
   * @param file - file blob
   */
  async uploadImage(folder: string, name: string, file: File | null): Promise<string> {

    const ext = file!.name.split('.').pop();
    const path = `${folder}/${name}.${ext}`;

    if (file!.type.split('/')[0] !== 'image') {
      throw { code: 'image/file-type' };
    }
    else {
      this.showPercent = true;
      const task = this.storage.upload(path, file);
      const ref = this.storage.ref(path);
      this.uploadPercent = task.percentageChanges();

      // upload image, return url
      await task.catch((e: any) => console.log(e));
      this.showPercent = false;
      return await ref.getDownloadURL().toPromise();
    }
  }
}
