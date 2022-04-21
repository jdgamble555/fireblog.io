import { TestBed } from '@angular/core/testing';
import { StorageModule } from '@angular/fire/storage';
import { FirebaseModule } from './firebase.module';

import { ImageUploadService } from './image-upload.service';

describe('ImageUploadService', () => {
  let service: ImageUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StorageModule, FirebaseModule]
    });
    service = TestBed.inject(ImageUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
