export const environment = {
  production: true,
  firebase: JSON.parse(process.env.FIREBASE_API_PROD as string),
  title: 'Fireblog.io',
  domain: 'fireblog.io',
  description: 'A blog about Firebase and Firestore! Search, Indexing, Rules, and more!',
  short_desc: 'Advanced Techniques for Firebase and Firestore!',
  site: "https://fireblog.io",
  storage: 'fireblog',
  author: 'Jonathan Gamble',
  icon: 'whatshot',
  icon_class: 'ng-fire',
  icon_dark_class: 'ng-fire',
  back: ''
};

/*export const environment = {
  production: false,
  supabase_url: process.env["SUPABASE_URL"] as string,
  supabase_key: process.env["SUPABASE_KEY"] as string,
  title: 'Code.Build',
  domain: 'code.build',
  description: 'A blog about Databases, Searching, Indexing, Programming, Security, Hosting, and Other Website Technologies!',
  short_desc: 'An easier way to code',
  site: "https://code.build",
  storage: 'code-build',
  author: 'Jonathan Gamble'
};*/

