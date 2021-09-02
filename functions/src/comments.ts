import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
try { admin.initializeApp(); } catch (e) { }

exports = module.exports = functions.firestore
    .document('posts/{postId}/comments/{commentId}')
    .onWrite((snap: any, context: any) => {

        // var commentId = event.data.data();
        //const commentId = event.params.commentId;
        const postId = context.params.postId;

        // ref to the parent document
        const docRef = admin.firestore().collection('posts').doc(postId);

        // get all comments and aggregate
        return docRef.collection('comments').orderBy('createdAt', 'desc')
            .get()
            .then((querySnapshot: { size: any; forEach: any }) => {

                // get the total comment count
                const commentCount = querySnapshot.size;

                const recentComments: any[] = [];

                // add data from the 5 most recent comments to the array
                querySnapshot.forEach((doc: { data: () => any; }) => {
                    recentComments.push(doc.data());
                });

                recentComments.splice(5);

                // record last comment timestamp
                const lastActivity = recentComments[0].createdAt;

                // data to update on the documemnt
                const data = { commentCount, recentComments, lastActivity };

                // run update
                return docRef.update(data);
            })
            .catch((err: any) => console.log(err));
    });