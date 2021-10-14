import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  docData,
  DocumentData,
  DocumentReference,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  SetOptions,
  writeBatch
} from "@angular/fire/firestore";
import {
  combineLatest,
  Observable,
  of
} from "rxjs";
import {
  map,
  switchMap
} from "rxjs/operators";

export async function setWithCounter(
  ref: DocumentReference<DocumentData>,
  data: {
    [x: string]: any;
  },
  options?: SetOptions,
  paths?: { [col: string]: string },
  dates = true
): Promise<void> {

  options = options ? options : {};

  // counter collection
  const counterCol = '_counters';
  const col = ref.path.split('/').slice(0, -1).join('/');
  const countRef = doc(ref.firestore, counterCol, col);
  const refSnap = await getDoc(ref);
  const _tmpDoc = ref;

  // don't increase count if edit
  if (refSnap.exists()) {
    if (dates) {
      data.updatedAt = serverTimestamp();
    }
    await setDoc(ref, data, options);

    // increase count
  } else {
    // set doc
    const batch = writeBatch(ref.firestore);
    if (dates) {
      data.createdAt = serverTimestamp();
    }
    batch.set(ref, data, options);

    // if other counts
    if (paths) {
      const keys = Object.keys(paths);
      keys.map((k: string) => {
        batch.update(
          doc(ref.firestore, `${k}/${paths[k]}`),
          { [col + 'Count']: increment(1), _tmpDoc }
        );
      });
    }
    // _counter doc
    batch.set(countRef, {
      count: increment(1),
      _tmpDoc
    }, { merge: true });
    // create counts
    return batch.commit();
  }
}

export async function deleteWithCounter(
  ref: DocumentReference<DocumentData>,
  paths?: { [col: string]: string }
): Promise<void> {

  // counter collection
  const counterCol = '_counters';
  const col = ref.path.split('/').slice(0, -1).join('/');
  const countRef = doc(ref.firestore, counterCol, col);
  const countSnap = await getDoc(countRef);
  const batch = writeBatch(ref.firestore);
  const _tmpDoc = ref;

  // if other counts
  if (paths) {
    const keys = Object.keys(paths);
    keys.map((k: string) => {
      batch.update(
        doc(ref.firestore, `${k}/${paths[k]}`),
        { [col + 'Count']: increment(-1), _tmpDoc }
      );
    });
  }
  // if count exists
  batch.delete(ref);
  if (countSnap.exists()) {
    batch.set(countRef, {
      count: increment(-1),
      _tmpDoc
    }, { merge: true });
  }
  // edit counts
  return batch.commit();
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
      ) : fields).map((f: any) => docData<any>(doc[f]))
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
        ) : fields).map((f: any) => docData<any>(doc[f]))
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

// remove later?

export async function updateTags(
  docRef: DocumentReference,
  before: string[] = [],
  after: string[] = [],
  tagsDoc = 'tags'
) {

  const removed = before.length > 0
    ? before.filter((x: string) => !after.includes(x))
    : [];
  const added = after.length > 0
    ? after.filter((x: string) => !before.includes(x))
    : [];

  const batch = writeBatch(docRef.firestore);

  // added
  for (const t of added) {

    // + 1 count
    const tagsRef = doc(docRef.firestore, tagsDoc + '/' + t);
    const tagsSnap = await getDoc(tagsRef);

    if (tagsSnap.exists()) {
      batch.update(tagsRef, {
        count: increment(1)
      });
    } else {
      batch.set(tagsRef, {
        count: 1
      });
    }

    // add tag
    batch.update(docRef, {
      tags: arrayUnion(t)
    });
  }

  // removed
  for (const t of removed) {

    // -1 count
    const tagsRef = doc(docRef.firestore, tagsDoc + '/' + t);
    const tagsSnap = await getDoc(tagsRef);

    if ((tagsSnap.data() as any).count == 1) {
      batch.delete(tagsRef);
    } else {
      batch.update(tagsRef, {
        count: increment(-1)
      });
    }

    // remove tag
    batch.update(docRef, {
      tags: arrayRemove(t)
    });
  }
  batch.commit();
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

    try {
      await setDoc(searchRef, data)
    } catch (e: any) {
      console.error(e);
    }
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