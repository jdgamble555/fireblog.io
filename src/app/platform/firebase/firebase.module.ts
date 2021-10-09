import { NgModule } from '@angular/core';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';


@NgModule({
  declarations: [],
  imports: [
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())
  ]
})
export class FirebaseModule {
  // shared on read and write functions
  soundex(s: string) {
    const a = s.toLowerCase().split("");
    const f = a.shift() as string;
    let r = "";
    const codes = {
      a: "",
      e: "",
      i: "",
      o: "",
      u: "",
      b: 1,
      f: 1,
      p: 1,
      v: 1,
      c: 2,
      g: 2,
      j: 2,
      k: 2,
      q: 2,
      s: 2,
      x: 2,
      z: 2,
      d: 3,
      t: 3,
      l: 4,
      m: 5,
      n: 5,
      r: 6,
    } as any;
    r = f + a
      .map((v: string) => codes[v])
      .filter((v: any, i: number, b: any[]) =>
        i === 0 ? v !== codes[f] : v !== b[i - 1])
      .join("");
    return (r + "000").slice(0, 4).toUpperCase();
  }
}
