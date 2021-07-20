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
  private newImage!: string | undefined;

  constructor(private storage: AngularFireStorage) { }

  /**
   * See if necessary to upload new image
   * @returns - true / false
   */
  get isNewImage(): boolean {
    return this.oldImage !== this.newImage;
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
  get image() {
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
    return Promise.resolve('');
  }

  /**
   * Returns Preview Image to display
   * @param event - file event
   * @param form - form reference
   */
  async showImage(event: Event, form: AbstractControl | null) {
    this.newImage = await this.previewImage(event);
    form?.markAsTouched();
  }

  /**
   * Delete Image from Storage Bucket
   * @param url - url of bucket item to delete
   * @returns - a resolved promise that image was deleted
   */
  private async deleteImage(url: string): Promise<void> {
    return await this.storage.storage.refFromURL(url).delete();
  }

  async setImage(folder: string, name: string, file?: File | null): Promise<string> {

    // don't do anything if no image change
    if (this.newImage) {

      // upload image
      const imageURL = await this.uploadImage(folder, name, file);

      // delete old image
      if (this.isNewImage) {
        await this.deleteImage(this.oldImage);
      }
      this.oldImage = imageURL;
      this.newImage = undefined;
      return imageURL;
    }
    return Promise.resolve('');
  }

  /**
   * Uploads Image to Storage Bucket
   * @param folder - folder containing image
   * @param name - file name
   * @param file - file blob
   */
  private async uploadImage(folder: string, name: string, file?: File | null): Promise<string> {

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
      await task;
      this.showPercent = false;
      return await ref.getDownloadURL().toPromise();
    }
  }
}
