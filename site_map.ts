import { environment } from '@env/environment';
import { getApp, getApps, initializeApp } from '@firebase/app';
import { Post, Tag } from '@post/post.model';
import { collection, CollectionReference, getDocs, getFirestore, limit, orderBy, query, QueryDocumentSnapshot, Timestamp, where } from "firebase/firestore";
import { SitemapStream } from 'sitemap';
import { createGzip } from 'zlib';

export const site_map = async ({ }, res: any) => {

  res.header("Content-Type", "application/xml");
  res.header("Content-Encoding", "gzip");

  try {
    const sitemapStream = new SitemapStream({
      hostname: environment.site,
      xmlns: {
        news: false,
        xhtml: true,
        image: true,
        video: false
      },
      xslUrl: 'https://gitcdn.xyz/repo/pedroborges/xml-sitemap-stylesheet/master/sitemap.xsl'
    });
    const pipeline = sitemapStream.pipe(createGzip());

    // firebase could be more efficient with firestore rest api

    // init firebase
    const config = JSON.parse(process.env.FIREBASE_API_PROD as string);
    const firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    const firestore = getFirestore(firebaseApp);

    let lastmod = new Date(1 - 1 - 2000);

    // post pages
    const postSnap = await getDocs<Post>(
      collection(firestore, 'posts') as CollectionReference<Post>
    );
    postSnap.forEach((doc: QueryDocumentSnapshot<Post>) => {

      const post = doc.data();
      const date = ((post.updatedAt ? post.updatedAt : post.createdAt) as Timestamp).toDate();

      // set date for site last updated
      if (lastmod < date) {
        lastmod = date;
      }

      sitemapStream.write({
        lastmod: date.toISOString(),
        url: `post/${doc.id}/${post.slug}`,
        img: post.image
      });

    });

    // tag pages
    const tagSnap = await getDocs<Tag>(collection(firestore, 'tags') as CollectionReference<Tag>);

    for (const doc of tagSnap.docs) {

      let updatedAt, createdAt, tagDate;

      // get last updated post date
      const pSnapUpdated = await getDocs<Post>(
        query(
          collection(firestore, 'posts'),
          where('tags', 'array-contains', doc.id),
          orderBy('updatedAt', 'desc'),
          limit(1)
        )
      );
      if (!pSnapUpdated.empty) {
        updatedAt = (pSnapUpdated.docs[0].data().updatedAt as Timestamp).toDate();
      }

      // get last created post date
      const pSnapCreated = await getDocs<Post>(
        query(
          collection(firestore, 'posts'),
          where('tags', 'array-contains', doc.id),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
      );
      if (!pSnapCreated.empty) {
        createdAt = (pSnapCreated.docs[0].data().createdAt as Timestamp).toDate();
      }

      // use the latest date
      if (createdAt && updatedAt) {
        tagDate = createdAt > updatedAt ? createdAt : updatedAt;
      } else {
        tagDate = updatedAt ? updatedAt : createdAt ? createdAt : lastmod;
      }

      sitemapStream.write({
        lastmod: tagDate.toISOString(),
        url: `t/${doc.id}`
      });

    }

    // homepage
    sitemapStream.write({
      lastmod,
      url: environment.site
    });

    sitemapStream.end();
    pipeline.pipe(res).on("error", (error: Error) => {
      throw error;
    });

  } catch (e: any) {
    console.error(e);
    res.status(500).end();
  }

};

// https://www.kgajera.com/blog/dynamic-sitemap-for-angular-universal-and-contentful/
