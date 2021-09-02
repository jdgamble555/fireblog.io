import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { trigramSearch } from 'adv-firestore-functions';
try { admin.initializeApp(); } catch (e) { }

exports = module.exports = functions.https.onCall(async (q: any) => {

  return await trigramSearch({
    query: q.query,
    col: 'posts',
    fields: q.fields,
  });

});


/*exports = module.exports = functions.https.onCall(async (q: any, context: functions.https.CallableContext) => {

    let query: admin.firestore.CollectionReference | admin.firestore.Query = db.collection('posts');

    // where clauses
    if (q.conditions) {
        q.conditions.forEach((c: any[]) => {
            query = query.where(c[0], c[1], c[2]);
            console.log(c);
        });
    }
    // sort
    if (q.orderBy) {
        query = query.orderBy(q.orderBy[0], q.orderBy[1]);
    }

    // results per page
    if (q.limit) {
        if (q.page) {
            query = query.limit(q.limit).offset(q.limit * q.page - q.limit);
        } else {
            query = query.limit(q.limit);
        }
    }

    // return results
    const docsSnap = await query.get();

    return docsSnap.docs.map((doc: any) => {
        const data = doc.data();
        data.id = doc.id;
        data.published = new Date(data.published._seconds * 1000).toString();
        data.updated = new Date(data.updated._seconds * 1000).toString();
        data.userDoc = { path: data.userDoc._path.segments.join('/') };
        return data;
    });
});
*/



