import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { ImageUploadService } from 'src/app/shared/image-upload/image-upload.service';
import { Tag, TagService } from 'src/app/tag/tag.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {

  validationMessages: any = {
    title: {
      required: 'Title is required.',
    },
    content: {
      required: 'Content is required.',
    },
    tags: {
      required: 'At least one tag is required.',
    }
  };

  postForm: FormGroup;
  isNewPage = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public ts: TagService,
    public is: ImageUploadService,
    private afs: AngularFirestore
  ) {

    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      tags: ['', Validators.required]
    });

  }

  ngOnInit(): void {

    const r = this.router.url;

    if (r.startsWith('/edit')) {

      this.isNewPage = false;
      const id = this.route.snapshot.paramMap.get('id');

      if (!id) {
        // no id input
        this.router.navigate(['/home']);
        return;
      }

      // fill in the form data from db
      this.afs.doc<Post>('posts' + '/' + id)
        .valueChanges()
        .pipe(
          tap((post: Post | undefined) => {
            if (post) {
              // add image
              this.is.imageURL = post.image ? post.image : '';

              // add tags
              this.ts.patch(post.tags);

              // add values
              this.postForm.patchValue({
                title: post.title,
                content: post.content
              });
            } else {
              // id does not exist
              this.router.navigate(['/home']);
            }
          }),
          take(1)
        ).subscribe();
    }
  }

  // get field
  getField(field: string) {
    return this.postForm.get(field);
  }

  // get error
  getError(field: string) {
    const errors = this.validationMessages[field];
    for (const e of Object.keys(errors)) {
      if (this.postForm.get(field)?.hasError(e)) {
        return errors[e];
      }
    }
  }

  async showImage(event: any) {
    this.is.imageURL = await this.is.previewImage(event);
    this.postForm.markAsTouched();
  }

  onSubmit() {

  }

}
