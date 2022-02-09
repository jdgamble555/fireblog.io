import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthComponent } from '../auth/auth.component';
import { firstValueFrom, isObservable, Observable } from 'rxjs';


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

  async waitFor(prom: Promise<any> | Observable<any>): Promise<any> {
    if (isObservable(prom)) {
      prom = firstValueFrom(prom);
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

