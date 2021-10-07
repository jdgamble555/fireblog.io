import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

// Firebase import
import { FbImageUploadService } from '../firebase/fb-image-upload.service';
import { Storage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService extends FbImageUploadService {
  constructor(
    storage: Storage,
    @Inject(DOCUMENT) document: Document
  ) {
    super(storage, document);
  }
}
