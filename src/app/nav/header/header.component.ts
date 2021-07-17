import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take, debounceTime } from 'rxjs/operators';
import { Observable, from, combineLatest } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { NavService } from '../nav.service';
import { BreadCrumbsService } from 'src/app/shared/bread-crumbs/bread-crumbs.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {

  @Output() menuButtonClicked = new EventEmitter();
  @Input() title!: string;

  isActiveSearch = false;

  myForm!: FormGroup;

  term!: string;

  trigrams!: any[];

  options!: Observable<any>;

  constructor(
    public auth: AuthService,
    public ns: NavService,
    private router: Router,
    private fb: FormBuilder,
    private afs: AngularFirestore,
    public bcs: BreadCrumbsService
  ) {
    this.myForm = this.fb.group({
      term: [''],
    });
  }

  ngOnInit() {

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.bcs.getDirectories();
      }
    });
  }

  mySerach() {

    const formValue = this.myForm.value;

    if (!formValue['term']) {
      this.options = from([]);
      return;
    }

    // get the term from your form control
    this.term = this.myForm.get('term')?.value.toLowerCase();

    // set your collection
    const col = 'posts';
    const lim = 10;

    // default index options
    const fields = ['_all'];

    const searchCol = '_trigrams';
    const termField = '_term';

    this.trigrams = tg(this.term);
    const s: any[] = [];
    const searchable: any = [];

    // create searchable queries
    searchable.push({ s: this.trigrams, r: 3 })
    for (const a of this.trigrams) {
      const tg2 = this.trigrams.filter((t: any) => t !== a);
      searchable.push({ s: tg2, r: 2 });
      for (const b of tg2) {
        const tg3 = tg2.filter((t: any) => t !== b);
        searchable.push({ s: tg3, r: 1 });
      }
    }
    // go through each field
    for (const field of fields) {
      // go through all searchable queries
      for (const gram of searchable) {
        const query = this.afs.collection(`${searchCol}/${col}/${field}`, (ref) => {
          let newRef: any = ref;
          for (const t of gram.s) {
            newRef = newRef.where(`${termField}.${t}`, '==', true);
          }
          return newRef.limit(10);
        });
        // push to new query
        s.push(query.snapshotChanges()
          .pipe(
            map((actions: any) => {
              return actions.map((a: any) => {
                const data: any = a.payload.doc.data();
                a.id = a.payload.doc.id;
                a.relevance = gram.r;
                delete data[termField]
                a.term = Object.values(data).join(' ');
                return { ...a, ...data };
              })
            }),
            take(1),
            debounceTime(200)
          ));
      }
    }
    const ids: any = {};
    let i = 0;
    this.options = combineLatest(s).pipe(
      map((arr: any) => arr.reduce((acc: any, cur: any) => acc.concat(cur))),
      map((f: any) =>
        f.filter((r: any) => {
          // filter duplicates
          if (ids[r.id]) {
            ids[r.id] += r.relevance;
            return;
          }
          ids[r.id] = r.relevance;
          return r;
        })
      ),
      map((r: any) => {
        // merge relevances
        r.relevance = ids[r.id];
        return r;
      }),
      map((r: any) =>
        r.sort((a: any, b: any) => b.relevance < a.relevance ? -1 : a.relevance ? 1 : 0)
      ),
      map((f: any) =>
        f.filter((r: any) => {
          // limit opts.limit
          if (i < lim) {
            ++i;
            return r;
          }
          return;
        })
      )
    );
    // get trigrams
    function tg(s1: string) {
      const n = 3;
      const r: string[] = [];
      for (let k = 0; k <= s1.length - n; k++)
        r.push(s1.substring(k, k + n));
      return r;
    }
  }
}

