import { NgModule } from '@angular/core';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ImageModule } from './image.module';

@NgModule({
  imports: [
    ImageModule,
    provideStorage(() => getStorage())
  ]
})
export class PostEditModule { }
