import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from './post.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    deps: [PostService],
    useFactory: (ps: PostService) => async () => await ps.loadPosts(),
    multi: true
  }],
})
export class PostModule { }
