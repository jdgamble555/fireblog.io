import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  uploadPercent: Observable<number> | any = null;

  showPercent = false;
  isNewImage = false;

  fileEvent!: any;
  image!: any;

  imageURL = '';

  constructor(
    private storage: AngularFireStorage
  ) { }

  async previewImage(event: any): Promise<any> {

    this.isNewImage = true;

    // add event to image service
    this.fileEvent = event;

    // view file before upload
    const file = event.target.files[0];

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

  async deleteImage(url: string): Promise<void> {

    // check 'storage/invalid-argument' error
    return this.storage.storage.refFromURL(url).delete();
  }

  async uploadImage(folder: string, name: string, file?: File | null): Promise<void> {

    // get file and folder name
    if (!file) {
      file = this.fileEvent.target.files[0];
      if (!this.fileEvent) {
        return;
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

      // upload image, save url
      await task;
      this.imageURL = await ref.getDownloadURL().toPromise();
      this.showPercent = false;
    }
  }
}

