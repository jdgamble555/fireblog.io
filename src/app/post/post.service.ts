import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Post } from './post.model';
import { Router, ParamMap } from '@angular/router';
import { TagService } from '../tag/tag.service';
import { Observable } from 'rxjs';

import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../auth/auth.service';
import { Condition, FirestoreService, OrderBy } from '../shared/firestore/firestore.service';
import { SeoService } from '../shared/seo/seo.service';
import { BreadCrumbsService } from '../shared/bread-crumbs/bread-crumbs.service';
import { User } from '../auth/user.model';


@Injectable({
  providedIn: 'root'
})

export class PostService {

  postDoc!: AngularFirestoreDocument<Post>;
  pageNum!: number;
  page!: string;

  disableNextButton!: boolean;

  // site title
  siteTitle = 'fireblog.io';

  // change this to your desired page size
  pageSize: number = 3;

  results!: Observable<any>;

  // search variables
  tagSearch!: string;
  userSearch!: string;
  titleSearch!: string;
  favoriteSearch!: string;
  catSearch!: string;

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    public auth: AuthService,
    private ts: TagService,
    private fs: FirestoreService,
    public afa: AngularFireAuth,
    public seo: SeoService,
    private bcs: BreadCrumbsService
  ) { }

  loadPosts(params: ParamMap, user: User, category?: string) {

    // Routing
    let r = this.router.url;

    // Reset variables for routing
    this.resetRouting();

    // category navigation
    if (category) {
      this.catSearch = category;
      this.page = 'category';

      this.seo.generateTags({
        title: this.siteTitle + ': ' + category,
        description: 'Posts in the ' + category + ' category.'
      });

      // tags navigation
    } else if (r.startsWith('/blog/tag')) {

      this.tagSearch = this.ts.tagFormat(params.get('tag')!);
      this.page = 'tag';

      this.seo.generateTags({
        title: this.siteTitle + ': ' + this.tagSearch,
        description: 'Posts with the ' + this.tagSearch + ' tag.'
      });

      // my posts navigation
    } else if (r.startsWith('/blog/my-posts')) {
      this.userSearch = user.uid;
      this.page = 'my-posts';

      this.seo.generateTags({
        title: this.siteTitle + ': My Posts',
        description: 'My Posts'
      });

      // user navigation
    } else if (r.startsWith('/blog/favorites')) {
      this.favoriteSearch = user.uid;
      this.page = 'favorites';

      this.seo.generateTags({
        title: this.siteTitle + ': Favorites',
        description: 'Posts by ' + this.favoriteSearch
      });

    } else if (r.startsWith('/blog/user')) {

      this.userSearch = params.get('user')!;
      this.page = 'user';

      this.seo.generateTags({
        title: this.siteTitle + ': ' + this.userSearch,
        description: 'Posts with the ' + this.userSearch + ' tag.'
      });

      // specific post navigation
    } else if (r.startsWith('/blog/post')) {

      // ** seo generated on template

      this.page = 'post';
      this.titleSearch = params.get('title')!;

      // otherwise all posts
    } else {
      this.page = '';
    }
    if (r.includes('/page')) {
      this.pageNum = parseInt(params.get('page')!);
    }
    else {
      this.pageNum = 1;
    }
    this.disableNext(user?.uid);
    return this.getPosts();

  }



  getPosts() {

    let q = {
      collection: 'posts',
      conditions: new Array<Condition>(),
      limit: this.pageSize,
      page: this.pageNum,
      orderBy: <OrderBy | null>{},
      startAt: '',
      endAt: ''
    };

    if (this.catSearch) {
      const c: Condition = {
        fieldPath: "category",
        opStr: "==",
        value: this.catSearch
      };
      q.conditions.push(c);
    }
    else if (this.tagSearch) {
      const c: Condition = {
        fieldPath: "tags",
        opStr: "array-contains",
        value: this.ts.tagFormat(this.tagSearch)
      };
      q.conditions.push(c);
    }
    else if (this.titleSearch) {
      const c: Condition = {
        fieldPath: "titleURL",
        opStr: "==",
        value: this.titleSearch
      };
      q.conditions.push(c);
      q.limit = 1;
    }
    else if (this.favoriteSearch) {
      q.collection = 'likes';
      const c: Condition = {
        fieldPath: "userId",
        opStr: "==",
        value: this.favoriteSearch
      };
      q.conditions.push(c);
      q.orderBy = {
        fieldPath: "createdAt",
        directionStr: "desc"
      };
      return this.fs.leftJoin('likes', q, 'postId', 'posts', 'id');
    }
    else if (this.userSearch) {
      const c: Condition = {
        fieldPath: "userId",
        opStr: "==",
        value: this.userSearch
      };
      q.conditions.push(c);
    }
    q.orderBy = {
      fieldPath: "createdAt",
      directionStr: "desc"
    };
    return this.fs.query('posts', q);
  }

  loadPrev() {
    this.router.navigate([this.getRouteBase() + --this.pageNum]);
  }

  loadNext() {
    this.router.navigate([this.getRouteBase() + ++this.pageNum]);
  }

  home() {
    this.router.navigate(['/']);
  }

  minutesToRead(data: string): string {
    const wordCount = data.trim().split(/\s+/g).length;
    return (wordCount / 100 + 1).toFixed(0);
  }

  getRouteBase() {
    let page = '/blog/';

    if (this.page) {
      if (this.page === 'user') {
        this.page += '/' + this.userSearch;
      } else if (this.page === 'tag') {
        this.page += '/' + this.bcs.getFriendlyURL(this.tagSearch);
      } else if (this.page === 'category') {
        this.page += '/' + this.catSearch;
        return 'directory/' + this.page + '/page/';
      }
      this.page += '/';
    }
    return page + this.page + 'page/';
  }

  resetRouting() {
    this.userSearch = '';
    this.tagSearch = '';
    this.titleSearch = '';
    this.favoriteSearch = '';
    this.catSearch = '';
    this.pageNum = 1;
  }

  disableNext(uid?: string) {

    // disable view post page
    if (this.page === 'post') {
      this.disableNextButton = true;
      // check for tag next page
    } else if (this.page === 'tag') {
      this.getCounter(`tags/${this.tagSearch}`, 'count');
      // check for home page
    } else if (this.page === '') {
      this.getCounter('_counters/posts', 'count');
      // check for user pages
    } else if (this.page === 'my-posts') {
      this.getCounter(`users/${uid}`, 'postsCount');
    } else if (this.page === 'user') {
      this.getCounter(`users/${this.userSearch}`, 'postsCount');
      // check for favorites
    } else if (this.page === 'favorites') {
      this.getCounter(`users/${uid}`, 'likesCount');
    }
    return;
  }

  getCounter(name: string, field: string) {

    this.afs.doc(name).get().pipe(take(1)).subscribe(userDoc => {
      const data: any = userDoc.data();
      if (!data || data[field] === undefined) {
        console.log(field + " does not exist on " + name);
      } else if (data[field] > this.pageNum * this.pageSize) {
        this.disableNextButton = false;
        return;
      }
      this.disableNextButton = true;
    });
  }

  async getImageURL(uid: string) {
    return this.afs.firestore.doc(`users/${uid}`).get().then((p) => p.get('photoURL'));
  }

  getPostData(id: string) {
    return this.afs.doc<Post>(`posts/${id}`).valueChanges();
  }

  create(data: Post, newId?: string) {
    if (newId) {
      this.afs.collection('posts').doc(newId).set(data);
    } else {
      this.afs.collection('posts').add(data);
    }
  }

  createId() {
    return this.afs.createId();
  }

  getPost(id: string) {
    return this.afs.doc<Post>(`posts/${id}`);
  }

  delete(id: string) {
    this.getPost(id).delete();
    this.router.navigate(['blog/']);
  }

  update(data: any, id: string,) {
    return this.getPost(id).update(data);
  }

}
