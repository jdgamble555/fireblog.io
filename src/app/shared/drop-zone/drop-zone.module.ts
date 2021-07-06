import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropZoneDirective } from './drop-zone.directive';


@NgModule({
  declarations: [DropZoneDirective],
  imports: [
    CommonModule
  ],
  exports: [DropZoneDirective]
})
export class DropZoneModule { }
