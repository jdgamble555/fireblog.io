import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { TagComponent } from './tag.component';


@NgModule({
  declarations: [TagComponent],
  imports: [CoreModule],
  exports: [TagComponent]
})
export class TagModule { }
