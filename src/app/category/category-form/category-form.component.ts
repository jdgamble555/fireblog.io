import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import { AngularFirestore } from '@angular/fire/firestore'
import { Observable, of } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryService } from '../category.service';
import { tap, take, debounceTime, map } from 'rxjs/operators';
import { MyErrorStateMatcher } from 'src/app/shared/form-validators';
import { AuthService } from 'src/app/auth/auth.service';
import { NavService } from 'src/app/nav/nav.service';
import { ToolsService } from 'src/app/shared/tools.service';
import { BreadCrumbsService } from 'src/app/shared/bread-crumbs/bread-crumbs.service';



@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {

  id = '';
  title = '';

  titleAvailable!: boolean;
  isNewTitle!: boolean;

  myForm!: FormGroup;
  myDoc!: Observable<any>;

  myPath!: string;

  page!: string;

  state!: string;

  categories!: Observable<any>;

  matcher = new MyErrorStateMatcher();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute,
    private nav: NavService,
    public cs: CategoryService,
    private tools: ToolsService,
    private bcs: BreadCrumbsService
  ) {
    this.categories = cs.getCategoriesFriendly();
  }

  get titleRef() {
    return this.myForm.get('title');
  }

  ngOnInit() {

    // no left nav
    this.nav.closeLeftNav();

    this.myForm = this.fb.group({
      title: ['', Validators.required, this.checkUnique.bind(this)],
      description: ['', Validators.required],
      state: ['unpublished', Validators.required],
      parent: ['']
    });

    // Routing - New, Edit, or 404
    let r = this.router.url;

    // new category
    if (r === '/directory/new') {
      this.myPath = 'categories';
      this.page = 'new';
      // edit a category
    } else if (r.includes('/directory/edit')) {
      this.page = 'edit';
      this.id = this.route.snapshot.paramMap.get('id')!;
      if (!this.id) {
        // no category id to edit
        this.router.navigate(['/404']);
        return;
      }
      // grab category data from database
      this.myPath = 'categories' + '/' + this.id;
      this.afs.doc(this.myPath)
        .valueChanges()
        .pipe(
          tap((post: any) => {
            // update fields with values from db
            if (post) {
              this.title = post.title;
              this.myForm.patchValue(post);
            }
            else {
              // incorrect category id
              this.router.navigate(['/404']);
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

  update() {

    try {
      const formValue = this.myForm.value;
      const uid = this.auth.uid$;
      const data = {
        userId: uid,
        userDoc: this.afs.firestore.doc('users/' + uid),
        description: formValue.description,
        title: formValue.title,
        parent: formValue.parent
      };
      // add a category
      if (this.page === 'new') {
        this.cs.create(data);
        // edit a category
      } else {
        this.cs.update(this.id, data);
      }
    } catch (err) {
      console.error(err);
    }
    this.router.navigate(['/directory']);
  }

  checkUnique(control: AbstractControl): Observable<ValidationErrors | null> {

    // get the field value
    const field = control.value;
    const oldField = this.title;
    const parent = this.myForm.get('parent')?.value;

    let catPath = parent + '/' + this.bcs.getFriendlyURL(field);
    catPath = catPath.replace(/\//g, '_');


    // don't test if same as old value
    this.isNewTitle = this.tools.isNewUnique(this.bcs.getFriendlyURL(field), this.bcs.getFriendlyURL(oldField));

    if (!this.isNewTitle) {
      return of(null);
    }

    this.titleAvailable = false;

    return this.tools.checkUnique('categories/catPath', this.bcs.getFriendlyURL(catPath))
      .valueChanges()
      .pipe(
        debounceTime(500),
        take(1),
        map((doc: any) => {
          if (doc) {
            return { 'uniqueField': { value: field } };
          }
          this.titleAvailable = true;
          return null;
        })
      );
  }

}
