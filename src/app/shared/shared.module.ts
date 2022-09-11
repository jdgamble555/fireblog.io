import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@core/core.module';
import { PostListService } from '@post/post-list/post-list.service';
import { AutoSaveDirective } from './auto-save/auto-save.directive';
import { ConfirmDialogModule } from './confirm-dialog/confirm-dialog.module';
import { DropZoneDirective } from './drop-zone/drop-zone.directive';
import { HeartComponent } from './heart/heart.component';
import { SaveComponent } from './save/save.component';


const modules = [
  FormsModule,
  ConfirmDialogModule,
  CoreModule
];

const directives = [
  AutoSaveDirective,
  DropZoneDirective
];

const components = [
  HeartComponent,
  SaveComponent
]

@NgModule({
  declarations: [
    ...directives,
    ...components
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...directives,
    ...components
  ],

  // preload tags and post count
  providers: [{
    provide: APP_INITIALIZER,
    deps: [PostListService],
    useFactory: (pls: PostListService) => async () => {
      await pls.loadTags();
      await pls.loadPostCount();
    },
    multi: true
  }]
})
export class SharedModule { }
