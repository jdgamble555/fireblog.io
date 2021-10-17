import { Component } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { isObservable, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { SeoService } from '../shared/seo/seo.service';

declare const Zone: any;

@Component({
  selector: 'app-root',
  templateUrl: './ssr.component.html',
  styleUrls: ['./ssr.component.scss']
})
export class SsrComponent {

  constructor(
    private seo: SeoService,
    private router: Router,
    private afs: Firestore
  ) {

    this.router.events.pipe(take(1)).subscribe(async (e: any) => {
      if (e) {
        const a = e.snapshot as ActivatedRouteSnapshot;
        if (a && a.url[0]) {
          this.meta(a.url[0].path, a.params);
        }
      }
    });
  }

  async meta(root: string, params: any) {

    const site = 'Fireblog.io';

    let title;

    // define types
    if (root === 'login') {
      title = 'Login';
    } else if (root === 'register') {
      title = 'Register';
    } else if (root === 'reset') {
      title = 'Forgot Password';
    } else if (root === 'verify') {
      title = 'Verify Email Address';
    } else if (root === 'new') {
      title = 'New Post';
    } else if (root === 'edit') {
      title = 'Edit Post';
    } else if (root === 'settings') {
      title = 'Settings';
    } else if (root === 'bookmarks') {
      title = 'Bookmarks';
    } else if (root === 'blog') {
      title = 'Post';
    } else if (root === 'post') {
      const p = await this.waitFor(
        getDoc(
          doc(this.afs, 'posts', params.id)
        )
      );
      const r = p.data() as any;
      this.seo.generateTags({
        domain: site,
        image: r.image || undefined,
        description: r.content?.substring(0, 125).replace(/(\r\n|\n|\r)/gm, ""),
        title: r.title + ' - ' + site,
        user: 'Jonathan Gamble'
      });
      return;
    } else if (root === 't') {
      this.seo.generateTags({
        title: params.tag + ' - ' + site
      });
      return;
    } else if (root === 'u') {
      this.seo.generateTags({
        title: 'User - ' + site
      });
      return;
    }

    this.seo.generateTags({
      title: title + ' - ' + site
    });
  }

  async waitFor(prom: Promise<any> | Observable<any>): Promise<any> {
    if (isObservable(prom)) {
      prom = prom.pipe(take(1)).toPromise();
    }
    const macroTask = Zone.current
      .scheduleMacroTask(
        `WAITFOR-${Math.random()}`,
        () => { },
        {},
        () => { }
      );
    return prom.then((p: any) => {
      macroTask.invoke();
      return p;
    });
  }
}
