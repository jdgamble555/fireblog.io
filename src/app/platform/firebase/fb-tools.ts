import {
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  SetOptions,
  writeBatch
} from "@firebase/firestore";
import { PartialWithFieldValue } from "firebase/firestore";
import { docData } from "rxfire/firestore";
import {
  combineLatest,
  Observable,
  of
} from "rxjs";
import {
  map,
  switchMap
} from "rxjs/operators";


export async function setWithCounter<T>(
  ref: DocumentReference<T>,
  data: PartialWithFieldValue<T>,
  setOptions?: SetOptions,
  opts?: {
    paths?: { [col: string]: string },
    dates?: boolean,
  }
): Promise<void> {

  setOptions = setOptions ? setOptions : {};
  opts = opts ? opts : {};
  opts.dates = opts.dates === undefined
    ? true
    : opts.dates;

  const paths = opts.paths;

  // counter collection
  const counterCol = '_counters';
  const col = ref.path.split('/').slice(0, -1).join('/');
  const countRef = doc(ref.firestore, counterCol, col);
  const refSnap = await getDoc<T>(ref);

  // don't increase count if edit
  try {
    if (refSnap.exists()) {
      if (opts.dates) {
        data = { ...data as any, updatedAt: serverTimestamp() };
      }
      await setDoc<T>(ref, data, setOptions);

      // increase count
    } else {
      // set doc
      const batch = writeBatch(ref.firestore);

      if (opts.dates) {
        data = { ...data as any, createdAt: serverTimestamp() };
      }
      batch.set(ref, data, setOptions);

      // if other counts
      if (paths) {
        const keys = Object.keys(paths);
        keys.map((k: string) => {
          batch.update(
            doc(ref.firestore, `${k}/${paths[k]}`),
            {
              [col + 'Count']: increment(1),
              ['_' + col + 'Doc']: ref
            }
          );
        });
      }
      // _counter doc
      batch.set(countRef, {
        count: increment(1),
        _tmpDoc: ref
      }, { merge: true });
      // create counts
      return await batch.commit();
    }
  } catch (e: any) {
    throw e;
  }
}

export async function deleteWithCounter<T>(
  ref: DocumentReference<T>,
  opts?: {
    paths?: { [col: string]: string }
  }
): Promise<void> {

  opts = opts ? opts : {};
  const paths = opts.paths;

  // counter collection
  const counterCol = '_counters';
  const col = ref.path.split('/').slice(0, -1).join('/');
  const countRef = doc(ref.firestore, counterCol, col);
  const batch = writeBatch(ref.firestore);
  try {
    // if other counts
    if (paths) {
      const keys = Object.keys(paths);
      keys.map((k: string) => {
        batch.update(
          doc(ref.firestore, `${k}/${paths[k]}`),
          {
            [col + 'Count']: increment(-1),
            ['_' + col + 'Doc']: ref
          }
        );
      });
    }
    // delete doc
    batch.delete(ref);
    batch.set(countRef, {
      count: increment(-1),
      _tmpDoc: ref
    }, { merge: true });
    // edit counts
    return await batch.commit();
  } catch (e: any) {
    throw e;
  }
}

export function expandRef<T>(obs: Observable<T>, fields: any[] = []): Observable<T> {
  return obs.pipe(
    switchMap((doc: any) => doc ? combineLatest(
      (fields.length === 0 ? Object.keys(doc).filter(
        (k: any) => {
          const p = doc[k] instanceof DocumentReference;
          if (p) fields.push(k);
          return p;
        }
      ) : fields).map((f: any) => docData<any>(doc[f], { idField: 'id' }))
    ).pipe(
      map((r: any) => fields.reduce(
        (prev: any, curr: any) =>
          ({ ...prev, [curr]: r.shift() })
        , doc)
      )
    ) : of(doc))
  );
}

export function expandRefs<T>(obs: Observable<T[]>, fields: any[] = []): Observable<T[]> {
  return obs.pipe(
    switchMap((col: any[]) =>
      col.length !== 0 ? combineLatest(col.map((doc: any) =>
        (fields.length === 0 ? Object.keys(doc).filter(
          (k: any) => {
            const p = doc[k] instanceof DocumentReference;
            if (p) fields.push(k);
            return p;
          }
        ) : fields).map((f: any) => docData<any>(doc[f], { idField: 'id' }))
      ).reduce((acc: any, val: any) => [].concat(acc, val)))
        .pipe(
          map((h: any) =>
            col.map((doc2: any) =>
              fields.reduce(
                (prev: any, curr: any) =>
                  ({ ...prev, [curr]: h.shift() })
                , doc2
              )
            )
          )
        ) : of(col)
    )
  );
}

export async function searchIndex(docObj: Document, opts: {
  ref: DocumentReference<DocumentData>,
  after: any,
  fields: string[],
  del?: boolean,
  useSoundex?: boolean
}) {

  opts.del = opts.del || false;
  opts.useSoundex = opts.useSoundex || true;

  const allCol = '_all';
  const searchCol = '_search';
  const termField = '_term';
  const numWords = 6;

  const colId = opts.ref.path.split('/').slice(0, -1).join('/');

  // get collection
  const searchRef = doc(
    opts.ref.firestore,
    `${searchCol}/${colId}/${allCol}/${opts.ref.id}`
  );
  try {
    if (opts.del) {
      await deleteDoc(searchRef);
    } else {

      let data: any = {};
      let m: any = {};

      // go through each field to index
      for (const field of opts.fields) {

        // new indexes
        let fieldValue = opts.after[field];

        // if array, turn into string
        if (Array.isArray(fieldValue)) {
          fieldValue = fieldValue.join(' ');
        }
        let index = createIndex(docObj, fieldValue, numWords);

        // if filter function, run function on each word
        if (opts.useSoundex) {
          const temp = [];
          for (const i of index) {
            temp.push(i.split(' ').map(
              (v: string) => soundex(v)
            ).join(' '));
          }
          index = temp;
          for (const phrase of index) {
            if (phrase) {
              let v = '';
              const t = phrase.split(' ');
              while (t.length > 0) {
                const r = t.shift();
                v += v ? ' ' + r : r;
                // increment for relevance
                m[v] = m[v] ? m[v] + 1 : 1;
              }
            }
          }
        } else {
          for (const phrase of index) {
            if (phrase) {
              let v = '';
              for (let i = 0; i < phrase.length; i++) {
                v = phrase.slice(0, i + 1).trim();
                // increment for relevance
                m[v] = m[v] ? m[v] + 1 : 1;
              }
            }
          }
        }
      }
      data[termField] = m;

      data = {
        ...data,
        slug: opts.after.slug,
        title: opts.after.title
      };
      return await setDoc(searchRef, data);
    }
  } catch (e: any) {
    throw e;
  }
}

export function createIndex(doc: Document, html: string, n: number): string[] {
  // create document after text stripped from html
  // get rid of pre code blocks
  const beforeReplace = (text: any) => {
    return text.replace(/&nbsp;/g, ' ').replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, '');
  }
  const createDocs = (text: string) => {
    const finalArray: string[] = [];
    const wordArray = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/ +/g, ' ')
      .trim()
      .split(' ');
    do {
      finalArray.push(
        wordArray.slice(0, n).join(' ')
      );
      wordArray.shift();
    } while (wordArray.length !== 0);
    return finalArray;
  }
  // strip text from html
  const extractContent = (html: string) => {
    const tmp = doc.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  // get rid of code first
  return createDocs(
    extractContent(
      beforeReplace(html)
    )
  );
}

export function soundex(s: string) {
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
