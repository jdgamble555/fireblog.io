import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthComponent } from '../auth/auth.component';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';


const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  RouterModule
];

const components = [
  AuthComponent
];

declare const Zone: any;
@NgModule({
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...components
  ],
  declarations: [
    ...components
  ]
})
export class CoreModule {

  // https://github.com/BeSpunky/angular-zen/blob/master/libs/angular-zen/router-x/services/route-aware.service.ts

  async waitFor(prom: Promise<any> | Observable<any>): Promise<any> {
    if (!(prom && 'then' in prom && typeof prom.then === 'function')) {
      prom = (prom as Observable<any>).pipe(take(1)).toPromise();
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
