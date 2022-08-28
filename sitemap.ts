import { Post } from '@post/post.model';
import { initializeApp } from 'firebase/app';
import { collection, CollectionReference, getDocs, getFirestore, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";

export const sitemap = async ({ }, res: any) => {

  const url = 'https://fireblog.io/post/';

  // init firebase
  const config = JSON.parse(process.env.FIREBASE_API_PROD as string);
  const firebaseApp = initializeApp(config);
  const firestore = getFirestore(firebaseApp);

  let r = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  `;

  const querySnap = await getDocs<Post>(collection(firestore, 'posts') as CollectionReference<Post>);
  querySnap.forEach((doc: QueryDocumentSnapshot<Post>) => {
    r += '  <url>\n';
    const post = doc.data();
    r += `    <loc>${url}${doc.id}/${post.slug}</loc>\n`;
    const date = ((post.updatedAt ? post.updatedAt : post.createdAt) as Timestamp).toDate().toISOString() || 0;
    r += `    <lastmod>${date}</lastmod>\n`;
    if (post?.image) {
      r += `    <image:image>\n`;
      r += `      <image:loc>${escapeHtml(post.image)}</image:loc>\n`;
      r += `    </image:image>\n`;
    }
    r += '  </url>\n';
  });

  r += '</urlset>\n';

  res.header('Content-Type', 'application/xml');
  res.status(200).send(r);
};

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

