import { TestBed } from '@angular/core/testing';
import { StorageModule } from '@angular/fire/storage';
import { RouterTestingModule } from '@angular/router/testing';


import { ImageUploadService } from './image-upload.service';

describe('ImageUploadService', () => {
  let service: ImageUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StorageModule, RouterTestingModule]
    });
    service = TestBed.inject(ImageUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
