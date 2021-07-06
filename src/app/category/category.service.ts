import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { Category } from './category.model';
import { BreadCrumbsService } from '../shared/bread-crumbs/bread-crumbs.service';



@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  parent!: string;

  // change to the directory you want here
  readonly catDir = '/directory/category';

  categories!: Observable<any>;

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private bcs: BreadCrumbsService
  ) { }

  loadCategories() {

    // setup
    this.parent = '';
    let r = this.router.url;

    // if sub-category
    if (r !== '/' && r !== '/directory') {
      this.parent = r.replace(this.catDir, '');
    }
    return this.getCategories(this.parent);
  }

  getCategories(parent: string) {

    return this.afs.collection('categories',
      ref => ref.where('parent', "==", parent)
    ).valueChanges({ idField: 'id' });
  }

  getCategoriesFriendly() {
    return this.afs.collection('categories',
      ref => ref.orderBy('catPath')
    ).valueChanges({ idField: 'id' });
  }

  // return a formated category URL
  getCatPath(parent: string, title: string) {
    return parent + '/' + this.bcs.getFriendlyURL(title);
  }

  // return the array of categories
  getCatArray(parent: string, title: string) {
    return this.getCatPath(parent, title).split('/').slice(1);
  }

  getBreadCrumbs(p: string) {
    return p.split("/");
  }

  getCategory(id: string) {
    return this.afs.doc<Category>(`categories/${id}`);
  }

  delete(id: string) {
    this.getCategory(id).delete();
  }

  update(id: string, data: any) {
    return this.getCategory(id).update(data);
  }

  create(data: any) {
    this.afs.collection('categories').add(data);
  }

}
