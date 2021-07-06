import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryService } from './category.service';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';



@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {

  categories!: Observable<any>;
  category!: string;
  roles!: string[];

  readonly root = '/directory/category';
  readonly edit = '/directory/edit';

  constructor(
    public auth: AuthService,
    public cs: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngOnInit() {

    // load categories / sub-categories
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.categories = this.route.data.pipe(
      switchMap(() => {
        return this.cs.loadCategories();
      })
    );

    // get current category or home
    const r = this.router.url;

    if (r === '/') {
      this.category = 'home';
    }
    else {
      this.category = r.replace(this.root, '');
    }
  }
}
