import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipList } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NavService } from 'src/app/nav/nav.service';
import { SnackbarService } from 'src/app/shared/snack-bar/snack-bar.service';
import { TagService } from 'src/app/shared/tag/tag.service';
import { Post } from '../post.model';
import { DialogService } from 'src/app/shared/confirm-dialog/dialog.service';
import { DbService } from 'src/app/platform/firebase/db.service';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { ImageUploadService } from 'src/app/platform/firebase/image-upload.service';


@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent {

  @ViewChild('chipList') chipList!: MatChipList;

  validationMessages: any = {
    title: {
      required: 'Title is required.',
      minlength: 'Title must be at least 2 characters long.'
    },
    content: {
      required: 'Content is required.',
      minlength: 'Content must be at least 3 characters long.'
    },
    tags: {
      required: 'At least one tag is required.',
      min: 'You cannot have more than 5 tags.'
    }
  };

  messages = {
    published: 'Your post is now published!',
    deleted: 'Your post is now deleted!',
    deleteConfirm: 'Are you sure you want to delete your post?'
  };

  postForm: FormGroup;
  isNewPage = true;
  id!: string;
  uid!: string;

  private image!: string | null;
  private imageFile!: File | undefined;
  private imageTmp!: string | null;

  imageView!: string | null;

  imageUploads: string[] = [];
  imageLoading = false;

  postSaving = false;
  title!: string;
  patchPost!: Observable<Post>;
  state!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public ts: TagService,
    public is: ImageUploadService,
    private auth: AuthService,
    private db: DbService,
    public sb: SnackbarService,
    private ns: NavService,
    private dialog: DialogService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      content: ['', [Validators.required, Validators.minLength(3)]],
      tags: this.fb.array([], [ts.tagValidatorMin(5), ts.tagValidatorRequired])
    });

    const r = this.router.url;

    // edit post
    if (r.startsWith('/edit')) {
      this.isNewPage = false;
      this.id = this.route.snapshot.paramMap.get('id') as string;

      if (!this.id) {
        // error, no id input
        this.router.navigate(['/home']);
        return;
      }

      this.patchPost = this.db.getPostData(this.id).pipe(
        tap((post: Post) => {
          if (post) {

            // add cover image
            this.image = post.image || null;
            this.imageView = post.imageTmp || post.image || null;
            this.imageTmp = post.imageTmp || null;

            // post image uploads
            this.imageUploads = post.imageUploads || [];

            // add tags
            this.ts.addTags(post.tags, this.tagsField);

          } else {
            // error, id does not exist in db
            this.router.navigate(['home']);
          }
        }),
        map((r: Post) => {
          const { tags, ...rest } = r;
          return rest;
        }));
    }

    // add title
    this.title = (this.isNewPage ? 'New' : 'Edit') + ' Post';

    // nav bar
    this.ns.addTitle(this.title);
    this.ns.closeLeftNav();
  }

  // get tags field as form array
  get tagsField(): FormArray {
    return this.getField('tags') as FormArray;
  }

  // get field
  getField(field: string): any {
    return this.postForm.get(field);
  }

  // get error
  getError(field: string): any {
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

  deleteCoverImage(): void {
    this.imageView = null;
    this.imageFile = undefined;
    this.postForm.updateValueAndValidity();
  }

  async addCoverImage(event: Event): Promise<void> {

    // get blob for upload
    const p = await this.is.previewImage(event);

    if (p && p.blob) {
      // get data to preview image
      this.imageView = await this.is.blobToData(p.blob);
      this.imageFile = this.is.blobToFile(p.blob, p.filename);
      this.postForm.updateValueAndValidity();

      // delete tmp cover image
      if (this.imageTmp) {
        await this.is.deleteImage(this.imageTmp);
        this.imageTmp = null;
      }
    }
  }

  async addPostImage(event: Event): Promise<void> {

    // add event to image service
    const target = event.target as HTMLInputElement;

    if (target.files?.length && this.id) {

      // view file before upload
      const file = target.files[0];

      // get user id
      const uid = (await this.auth.getUser())?.uid;

      // upload image with spinner
      this.imageLoading = true;
      const image = await this.is.uploadImage(`post_images/${uid}`, file);
      this.imageLoading = false;

      // save url to db
      await this.db.addPostImage(this.id, image);

      // add url to imageUploads array
      this.imageUploads.push(image);

      // show msg
      this.sb.showMsg('Image Added!', 500);
    }
  }

  async deletePostImage(val: string): Promise<void> {

    // delete image in db
    await this.db.deletePostImage(this.id, val);

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

  async onSubmit(publish = false): Promise<void> {

    let error = false;

    // prepare variables for db
    const formValue = this.postForm.value;
    const slug = this.ts.slugify(formValue.title);

    const uid = (await this.auth.getUser())?.uid;

    let data: Post = {
      authorId: uid,
      tags: this.ts.getTags(this.tagsField),
      content: formValue.content,
      title: formValue.title,
      minutes: this.minutesToRead(formValue.content),
      imageUploads: this.imageUploads,
      slug
    };

    // if new image, upload it
    if (this.imageFile) {
      try {
        const image = await this.is.uploadImage(`cover_images/${uid}`, this.imageFile);
        data = {
          ...data,
          imageTmp: image
        };
        this.imageFile = undefined;
        this.imageTmp = image;
      } catch (e: any) {
        console.error(e);
        error = true;
      }
    }

    // if delete image or change image
    if (publish && this.image !== this.imageView) {
      // delete old cover image file
      if (this.image) {
        try {
          await this.is.deleteImage(this.image);
        } catch (e: any) {
          console.error(e);
          error = true;
        }
      }

      // delete or change image
      data = {
        ...data,
        image: this.imageView
          ? this.imageTmp
          : null
      };
    }

    // add post to db
    try {
      this.id = await this.db.setPost(data, this.id, publish);
    } catch (e: any) {
      console.error(e);
      error = true;
    }

    if (publish && !error) {
      this.sb.showMsg(this.messages.published);
      this.router.navigate(['/post', this.id, slug]);
    }
  }

  async deletePost(): Promise<void> {

    const uid = (await this.auth.getUser())?.uid as string;

    const confirm = this.dialog.confirmDialog(this.messages.deleteConfirm);
    // delete when confirmed
    confirm.afterClosed()
      .subscribe((confirmed: any) => {

        // delete files
        if (confirmed) {

          // delete post cover image
          this.deleteCoverImage();

          // get uploaded images
          const files = this.imageUploads;

          // delete uploaded images
          if (files.length > 0) {
            for (const f of files) {
              this.deletePostImage(f);
            }
          }
          // delete post
          this.db.deletePost(this.id, uid);
          this.sb.showMsg(this.messages.deleted)
          this.ns.home();
        }
      });
  }

  updateState(e: any): void {
    this.state = e;
  }
}
