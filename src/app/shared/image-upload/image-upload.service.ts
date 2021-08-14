import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { ImageUploadModule } from './image-upload.module';

@Injectable({
  providedIn: ImageUploadModule
})
export class ImageUploadService {

  uploadPercent: Observable<number> | any = null;
  showPercent = false;

  private fileTarget!: HTMLInputElement;

  constructor(private storage: AngularFireStorage) { }

  /**
   * Gets an image blob before upload
   * @param event - file event
   * @returns - string blob of image
   */
  async previewImage(event: Event): Promise<string> {

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
