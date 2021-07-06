import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { BreadCrumbsService } from '../shared/bread-crumbs/bread-crumbs.service';
import { ToolsService } from '../shared/tools.service';
import { TagComponent } from './tag.component';
import { TagService } from './tag.service';


@NgModule({
  providers: [TagService, ToolsService, BreadCrumbsService],
  declarations: [TagComponent],
  imports: [CoreModule],
  exports: [TagComponent]
})
export class TagModule { }
