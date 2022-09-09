import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Preview {
  blob: Blob;
  filename: string;
}

@Injectable({
  providedIn: 'root'
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
    async getURL(gs: string): Promise<string | undefined> {
      return;
    }

    /**
     * Generate Random ID for Image Name
     * @returns randomly generated ID
     */
    randomID(): string {
      // generate image id
      return Array(16)
        .fill(0)
        .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
        .join('') +
        Date.now().toString(24);
    }
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

    blobToFile(blob: Blob, fileName: string): File {
      return new File([blob], fileName, { type: this.type });
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

    async scaleImage(src: any, newX?: number, newY?: number): Promise<Blob> {
      return new Promise((res: any, rej: any) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          const elem = this.document.createElement('canvas');
          if (newX) {
            elem.width = newX;
          }
          if (newY) {
            elem.height = newY;
          }
          const ctx = elem.getContext('2d') as CanvasRenderingContext2D;
          this.drawImageScaled(img, ctx);
          ctx.canvas.toBlob(res, this.type, 1);
        }
        img.onerror = error => rej(error);
      });
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
        const image = await this.blobToData(file);

        // return resized version
        const blob = await this.scaleImage(image, 800, 418);
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

      return;
    }

    /**
     * Uploads Image to Storage Bucket
     * @param folder - folder containing image
     * @param file - file blob
     * @param name - image file name, default random name
     */
    async uploadImage(folder: string, file: File | null, name = this.randomID()): Promise<string> {

      return '';

    }
}
