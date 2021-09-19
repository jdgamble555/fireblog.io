import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipList } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NavService } from 'src/app/nav/nav.service';
import { ImageUploadService } from 'src/app/platform/firebase/image-upload.service';
import { AuthService } from 'src/app/platform/firebase/auth.service';
import { DbService } from 'src/app/platform/firebase/db.service';
import { SeoService } from 'src/app/shared/seo/seo.service';
import { SnackbarService } from 'src/app/shared/snack-bar/snack-bar.service';
import { TagService } from 'src/app/shared/tag/tag.service';
import { Post } from '../post.model';
import { DialogService } from 'src/app/shared/confirm-dialog/dialog.service';


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

  messages = {
    published: 'Your post is now published!',
    deleted: 'Your post is now deleted!',
    deleteConfirm: 'Are you sure you want to delete your post?'
  };

  postForm: FormGroup;
  isNewPage = true;
  id!: string;
  uid!: string;

  image!: string;
  imageFile!: File;
  oldImage!: string;
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
    private seo: SeoService,
    private dialog: DialogService
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      tags: this.fb.array([], [ts.tagValidatorMin(5), ts.tagValidatorRequired])
    });
  }

  async ngOnInit(): Promise<void> {

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

            // add image
            this.image = this.oldImage = post.image || '';

            // add tags
            this.ts.addTags(post.tags, this.tagsField);

            // image uploads
            this.imageUploads = post.imageUploads || [];

          } else {
            // error, id does not exist in db
            this.router.navigate(['home']);
          }
        }),
        map((r) => {
          const { tags, ...rest } = r;
          return rest;
        }));
    }

    // add title
    this.title = (this.isNewPage ? 'New' : 'Edit') + ' Post';

    this.seo.generateTags({ title: this.title + ' - ' + this.ns.title });

    // nav bar
    this.ns.setBC(this.title);
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

  deleteImage(): void {

    // delete image in db
    this.db.deleteImage(this.id);

    // delete image file
    this.is.deleteImage(this.image);

  }

  async addImage(event: Event): Promise<void> {

    // preview image
    const blob = await this.is.previewImage(event);

    if (blob) {
      this.image = await this.is.blobToData(blob);
      this.imageFile = this.is.blobToFile(blob, this.is.fileName);
    }

    this.postForm.updateValueAndValidity();
  }

  async addPostImage(event: Event): Promise<void> {

    // add event to image service
    const target = event.target as HTMLInputElement;

    if (target.files?.length && this.id) {

      // view file before upload
      const file = target.files[0];

      // upload image with spinner
      this.imageLoading = true;
      const image = await this.is.uploadImage('posts', file);
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

    // prepare variables for db
    const formValue = this.postForm.value;
    const slug = this.ts.slugify(formValue.title);

    let data: Post = {
      authorId: (await this.auth.getUser())?.uid,
      tags: this.ts.getTags(this.tagsField),
      content: formValue.content,
      title: formValue.title,
      minutes: this.minutesToRead(formValue.content),
      slug
    };

    // upload image
    if (this.imageFile) {
      try {
        const image = await this.is.uploadImage('posts', this.imageFile);
        data = { ...data, image };
      } catch (e: any) {
        console.error(e);
      }
    }

    // add post to db
    try {
      this.id = await this.db.setPost(data, this.id, publish);
    } catch (e: any) {
      console.error(e);
    }

    if (publish) {
      this.sb.showMsg(this.messages.published);
      this.router.navigate(['/post', this.id, slug]);
    }
  }

  updateState(e: any): void {
    this.state = e;
  }

  deletePost(): void {

    const confirm = this.dialog.confirmDialog(this.messages.deleteConfirm);
    // delete when confirmed
    confirm.afterClosed()
      .subscribe((confirmed: any) => {
        if (confirmed) {
          this.db.deletePost(this.id);
          this.sb.showMsg(this.messages.deleted)
          this.ns.home();
        }
      });
  }
}
