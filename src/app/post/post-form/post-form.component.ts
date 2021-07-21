import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipList } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { ImageUploadService } from 'src/app/shared/image-upload/image-upload.service';
import { TagService } from 'src/app/tag/tag.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {

  @ViewChild('chipList') chipList!: MatChipList;

  validationMessages: any = {
    title: {
      required: 'Title is required.',
    },
    content: {
      required: 'Content is required.',
    },
    tags: {
      required: 'At least one tag is required.',
      min: 'You cannot have more than 5 tags.'
    }
  };

  postForm: FormGroup;
  isNewPage = true;
  id!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public ts: TagService,
    public is: ImageUploadService,
    private auth: AuthService,
    private ps: PostService
  ) {

    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      tags: this.fb.array([], [ts.tagValidatorMin(5), ts.tagValidatorRequired])
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

      // set id
      this.id = id;

      // fill in the form data from db
      this.ps.getPostById(id)
        .pipe(
          tap((post: Post | undefined) => {
            if (post) {
              // add image
              this.is.image = post.image;

              // add tags
              this.ts.addTags(post.tags, this.tagsField);

              // add values
              this.postForm.patchValue({
                title: post.title,
                content: post.content,
                //tags: post.tags
              });
            } else {
              // id does not exist
              this.router.navigate(['/home']);
            }
          })
        ).subscribe();
    }

    // tag validator
    this.postForm.statusChanges.subscribe((status: any) => {
      this.chipList.errorState = status === 'INVALID';
    });

  }

  // get tags field as form array
  get tagsField(): FormArray {
    return this.getField('tags') as FormArray;
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

  minutesToRead(data: string): string {
    const wordCount = data.trim().split(/\s+/g).length;
    return (wordCount / 100 + 1).toFixed(0);
  }

  async onSubmit() {

    // prepare variables for firestore
    const formValue = this.postForm.value;
    const uid = (await this.auth.getUser()).uid;
    const slug = this.ts.slugify(formValue.title);

    try {

      // get doc id
      if (!this.id) {
        this.id = this.ps.getId();
      }

      // upload image
      const imageURL = await this.is.setImage('posts', this.id);

      console.log(imageURL);

      let data: Post = {
        authorId: uid,
        tags: this.ts.getTags(this.tagsField),
        content: formValue.content,
        title: formValue.title,
        image: imageURL,
        minutes: this.minutesToRead(formValue.content),
        slug
      };

      console.log('1')
      await this.ps.setPost(data, this.id);
      console.log('3')

    } catch (e: any) {
      console.error(e);
    }
    this.router.navigate(['/post', this.id, slug]);
  }

}
