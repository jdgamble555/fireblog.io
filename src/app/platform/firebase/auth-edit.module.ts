import { NgModule } from '@angular/core';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { AuthDbModule } from './auth-db.module';
import { ImageModule } from './image.module';

@NgModule({
  imports: [
    AuthDbModule,
    ImageModule,
    provideStorage(() => getStorage())
  ]
})
export class AuthEditModule { }
