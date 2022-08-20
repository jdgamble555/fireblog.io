// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: JSON.parse(process.env.FIREBASE_API_DEV as string),
  title: 'Fireblog.io',
  domain: 'fireblog.io',
  description: 'A blog about Firebase and Firestore! Search, Indexing, Rules, and more!',
  short_desc: 'Advanced techniques for Firebase and Firestore!',
  site: "https://fireblog.io",
  storage: 'fireblog',
  author: 'Jonathan Gamble'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
