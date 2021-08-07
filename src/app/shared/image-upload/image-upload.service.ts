import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  uploadPercent: Observable<number> | any = null;
  showPercent = false;

  private fileTarget!: HTMLInputElement;
  private oldImage!: string;
  private newImage!: string;

  constructor(private storage: AngularFireStorage) { }

  /**
   * See if necessary to upload new image
   * @returns - true / false
   */
  get isNewImage(): boolean {
    return this.newImage !== undefined;
  }

  /**
   * Setter - Image URL
   */
  set image(url: string) {
    if (url !== this.newImage) {
      this.oldImage = url;
    }
  }

  /**
   * Getter - Image URL
   */
  get image(): string {
    return this.newImage || this.oldImage;
  }

  /**
   * Gets an image blob before upload
   * @param event - file event
   * @returns - string blob of image
   */
  private async previewImage(event: Event): Promise<string> {

    // add event to image service
    const target = event.target as HTMLInputElement;

    if (target.files?.length) {
      // view file before upload
      const file = target.files[0];
      this.fileTarget = target;

      // return image preview
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const image = reader.result as string;
          resolve(image);
        };
        reader.readAsDataURL(file);
      });
    }
    return '';
  }

  /**
   * Returns Preview Image to display
   * @param event - file event
   * @param form - form reference
   */
  async showImage(event: Event) {
    this.newImage = await this.previewImage(event);
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

  async removeImage(url: string): Promise<void> {

    this.oldImage = '';
    this.newImage = '';

    return await this.deleteImage(url);

  }

  async setImage(folder: string, name: string, file?: File | null): Promise<string> {

    // don't do anything if no image change
    if (this.isNewImage) {

      // delete old image
      await this.deleteImage(this.oldImage);

      // upload image
      const imageURL = await this.uploadImage(folder, name, file);

      this.oldImage = imageURL;
      this.newImage = '';
      return imageURL;
    }
    return this.oldImage;
  }

  /**
   * Uploads Image to Storage Bucket
   * @param folder - folder containing image
   * @param name - file name
   * @param file - file blob
   */
  async uploadImage(folder: string, name: string, file?: File | null): Promise<string> {

    // get file and folder name
    if (!file) {
      if (this.fileTarget.files?.length) {
        file = this.fileTarget.files[0];
      }
    }
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
