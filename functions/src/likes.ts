import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
try { admin.initializeApp(functions.config().firebase); } catch (e) { }
import { colCounter, queryCounter, eventExists } from 'adv-firestore-functions';

const db = admin.firestore();

exports = module.exports = functions.firestore
    .document('likes/{docId}')
    .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {

        // don't run if repeated function
        if (await eventExists(context)) {
            return null;
        }
        // simplify event types
        const updateDoc = change.before.exists && change.after.exists;

        if (updateDoc) {
            return null;
        }
        // simplify input data
        const after: any = change.after.exists ? change.after.data() : null;
        const before: any = change.before.exists ? change.before.data() : null;

        // likesCount on userDoc
        const uid = after ? after.userId : before.userId;
        const userRef = db.doc(`users/${uid}`);
        const likesQuery = db.collection('likes').where('userId', "==", uid);
        console.log("Updating likes count on user doc")
        await queryCounter(change, context, likesQuery, userRef, 'likesCount');

        // update regular counter doc
        console.log("Updating likes count");
        await colCounter(change, context);

        return null;
    });