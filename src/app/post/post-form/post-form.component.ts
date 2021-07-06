import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable, of } from 'rxjs';
import { tap, take, map, debounceTime } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PostService } from '../post.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { TagService, Tag } from '../../tag/tag.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ToolsService } from 'src/app/shared/tools.service';
import { CategoryService } from 'src/app/category/category.service';
import { BreadCrumbsService } from 'src/app/shared/bread-crumbs/bread-crumbs.service';
import { SnackbarService } from 'src/app/shared/snack-bar/snack-bar.service';
import { MyErrorStateMatcher } from 'src/app/shared/form-validators';
import { ImageUploadService } from 'src/app/shared/image-upload/image-upload.service';


//import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {


  titleAvailable!: boolean;
  isNewTitle!: boolean;

  categories!: Observable<any>;

  title = '';

  // old image url to delete
  oldImage = '';
  content = '';

  buttonText: string = "Create Post";

  // Form state
  loading = false;
  success = false;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  _tags: Array<Tag> = [];
  _tagsBefore: any;

  downloadURL!: Observable<string>;

  myForm!: FormGroup;
  myDoc!: Observable<any>;

  myPath!: string;

  page!: string;

  id = '';

  matcher = new MyErrorStateMatcher();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private afs: AngularFirestore,
    private postService: PostService,
    public tagsService: TagService,
    private router: Router,
    private route: ActivatedRoute,
    public tools: ToolsService,
    private cs: CategoryService,
    private sb: SnackbarService,
    public is: ImageUploadService,
    private bcs: BreadCrumbsService
  ) {
    this.categories = this.cs.getCategoriesFriendly();
  }

  get titleRef() {
    return this.myForm.get('title');
  }

  ngOnInit() {

    this.myForm = this.fb.group({
      title: ['', Validators.required, this.checkUnique.bind(this)],
      content: ['', Validators.required],
      summary: ['', Validators.required],
      newTags: [''],
      category: ['']
    });

    // Routing - New, Edit, or 404
    let r = this.router.url;

    // new post
    if (r.endsWith('/new')) {
      this.myPath = 'posts';
      this.page = 'new';

      // edit a post
    } else if (r.startsWith('/blog/edit')) {

      this.page = 'edit';
      this.id = this.route.snapshot.paramMap.get('post')!;

      // post does not exist
      if (!this.id) {
        this.router.navigate(['/404']);
        return;
      }
      this.myPath = 'posts' + '/' + this.id;

      // fill in the form data from db
      this.afs.doc(this.myPath)
        .valueChanges()
        .pipe(
          tap((post: any) => {
            if (post) {
              this.title = post.title;
              this.is.imageURL = post.image ? this.oldImage = post.image : '';
              let tags = post['tags'];
              this._tagsBefore = tags;
              tags.forEach((tag: any) => {
                // Add our tag
                this._tags = this.tagsService._addTag(this._tags, tag);
              });
              this.myForm.patchValue(post);
            }
          }),
          take(1)
        ).subscribe();
    }
    else {
      // page not found
      this.router.navigate(['/404']);
    }
  }

  isTitleChange() {
    return this.title !== this.myForm?.get('title')?.value;
  }

  async showImage(event: any) {
    this.is.imageURL = await this.is.previewImage(event);
    this.myForm.markAsTouched();
  }

  async submitHandler() {

    this.loading = true;

    // prepare tags for firestore
    const tags = this.tagsService.initTags(this._tags);
    const formValue = this.myForm.value;

    //let user: User = await this.auth.user$.pipe(take(1)).toPromise();

    let titleURL = this.bcs.getFriendlyURL(formValue['title']);

    try {

      // create id if new doc
      if (!this.id) {
        this.id = this.postService.createId();
      }
      if (this.is.isNewImage) {
        // delete old image
        this.is.deleteImage(this.oldImage);

        // upload new image
        await this.is.uploadImage('posts', this.id);

        // reset image
        this.is.isNewImage = false;
      }
      if (this.page === 'new') {
        const uid = this.auth.uid$;
        // create a page
        const data = {
          userId: uid,
          userDoc: this.afs.firestore.doc('users/' + uid),
          content: formValue.content,
          summary: formValue.summary,
          image: this.is.imageURL,
          title: formValue.title,
          titleURL,
          tags,
          category: formValue.category
        };
        this.postService.create(data, this.id);

      } else {
        // edit a page
        const data = {
          content: formValue.content,
          summary: formValue.summary,
          image: this.is.imageURL,
          title: formValue.title,
          titleURL,
          tags,
          category: formValue.category
        };
        // update post
        this.postService.update(data, this.id);
      }
      this.success = true;

    } catch (err) {
      console.error(err);
    }
    this.loading = false;
    this.router.navigate(['/blog', 'post', titleURL]);
  }

  // Tag tools
  addTag(event: MatChipInputEvent) {
    this._tags = this.tagsService.add(this._tags, event);
    this.myForm.markAsTouched();
  }

  removeTag(tag: Tag) {
    this._tags = this.tagsService.remove(this._tags, tag);
    this.myForm.markAsTouched();
  }

  checkUnique(control: AbstractControl): Observable<ValidationErrors | null> {

    // get the field value
    const field = control.value;
    const oldField = this.title;

    // don't test if same as old value
    if (!this.tools.isNewUnique(this.bcs.getFriendlyURL(field), this.bcs.getFriendlyURL(oldField))) {
      return of(null);
    }

    return this.tools.checkUnique('posts/title', this.bcs.getFriendlyURL(field))
      .valueChanges()
      .pipe(
        debounceTime(500),
        take(1),
        map((doc: any) => {
          if (doc) {
            return { 'uniqueField': { value: field } };
          }
          return null;
        })
      );
  }

  error(e: string): void {
    this.sb.showError(e);
  }
}
