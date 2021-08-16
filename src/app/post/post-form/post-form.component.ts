import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipList } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { NavService } from 'src/app/nav/nav.service';
import { ImageUploadService } from 'src/app/shared/image-upload/image-upload.service';
import { SeoService } from 'src/app/shared/seo/seo.service';
import { SnackbarService } from 'src/app/shared/snack-bar/snack-bar.service';
import { TagService } from 'src/app/tag/tag.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit, OnDestroy {

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

  image!: string;

  imageUploads!: string[];

  imageLoading = false;

  postSaving = false;

  title!: string;

  // subscriptions
  tagSub!: Subscription;
  formSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public ts: TagService,
    public is: ImageUploadService,
    private auth: AuthService,
    private ps: PostService,
    public sb: SnackbarService,
    private ns: NavService,
    private seo: SeoService
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

      this.ps.getPostById(id).pipe(take(1)).toPromise()
        .then((post: Post) => {
          if (post) {
            // add image
            this.image = post.image || '';

            // add tags
            this.ts.addTags(post.tags, this.tagsField);

            // image uploads
            this.imageUploads = post.imageUploads || [];

            // add values
            this.postForm.patchValue({
              title: post.title,
              content: post.content
            });
            this.postForm.markAsPristine();

          } else {
            // id does not exist
            this.router.navigate(['/home']);
          }
        });

    }

    // tag validator
    this.tagSub = this.tagsField.statusChanges.subscribe((status: string) => {
      this.chipList.errorState = status === 'INVALID';
    });

    // add title
    this.title = (this.isNewPage ? 'New' : 'Edit') + ' Post';

    this.seo.generateTags({ title: this.ns.title + ': ' + this.title });

    // add page bread crumb
    this.ns.setBC(this.title);

    // auto save
    this.formSub = this.postForm.valueChanges
      .pipe(
        debounceTime(2000),
        tap(() => {
          if (this.postForm.valid && this.postForm.dirty) {
            this.onSubmit();
            this.postForm.markAsPristine();
          }
        })
      ).subscribe();

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

  async deleteImage() {

    // delete image in db
    this.ps.deleteImage(this.id);

    // delete image file
    this.is.deleteImage(this.image);

  }

  async addImage(event: Event) {

    // preview image
    const blob = await this.is.previewImage(event) as Blob;

    this.image = await this.is.blobToData(blob);

    const file = new File([blob], 'new.png', { type: "image/png" });

    // upload image
    const image = await this.is.uploadImage('posts', this.id, file);

    const data = {
      id: this.id,
      image
    };

    // save url to db
    await this.ps.setPost(data);
  }

  async addPostImage(event: Event) {

    // add event to image service
    const target = event.target as HTMLInputElement;

    if (target.files?.length) {

      // view file before upload
      const file = target.files[0];

      // generate image id
      const randId = this.ps.getId();

      // upload image with spinner
      this.imageLoading = true;
      const image = await this.is.uploadImage('posts', randId, file);
      this.imageLoading = false;

      // save url to db
      this.id = await this.ps.addPostImage(this.id, image);

      // add url to imageUploads array
      this.imageUploads.push(image);

      // show msg
      this.sb.showMsg('Image Added!', 500);

    }
  }

  async deletePostImage(val: string) {

    // delete image in db
    await this.ps.deletePostImage(this.id, val);

    // delete image file
    await this.is.deleteImage(val);

    // delete from ImageUploads array
    const index = this.imageUploads.indexOf(val, 0);
    if (index > -1) {
      this.imageUploads.splice(index, 1);
    }

    // show msg
    this.sb.showMsg('Image Removed!', 500);

  }

  async onSubmit() {

    // prepare variables for firestore
    const formValue = this.postForm.value;
    const uid = (await this.auth.getUser()).uid;
    const slug = this.ts.slugify(formValue.title);

    let data: Post = {
      id: this.id,
      authorId: uid,
      tags: this.ts.getTags(this.tagsField),
      [this.isNewPage ? 'createdAt' : 'updatedAt']: this.ps.getDate(),
      content: formValue.content,
      title: formValue.title,
      minutes: this.minutesToRead(formValue.content),
      slug
    };

    // add post to db
    this.postSaving = true;
    await this.ps.setPost(data);
    this.postSaving = false;

    //this.router.navigate(['/post', this.id, slug]);
  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
    this.tagSub.unsubscribe();
  }

}
