export const environment = {
  production: true,
  firebase: JSON.parse(process.env.FIREBASE_API_PROD as string),
  title: 'Fireblog.io',
  domain: 'fireblog.io',
  description: 'A blog about Firebase and Firestore! Search, Indexing, Rules, and more!',
  short_desc: 'Advanced techniques for Firebase and Firestore!',
  site: "https://fireblog.io",
  storage: 'fireblog',
  author: 'Jonathan Gamble'
};
