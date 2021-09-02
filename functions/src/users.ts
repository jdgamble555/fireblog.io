import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
try { admin.initializeApp(); } catch (e) { }
import { colCounter, eventExists, updateJoinData, isTriggerFunction } from 'adv-firestore-functions';

const db = admin.firestore();

exports = module.exports = functions.firestore
  .document('users/{docId}')
  .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {


    // don't run if repeated function
    if (await eventExists(context) || isTriggerFunction(change, context)) {
      return null;
    }
    const queryRef = db.collection('posts').where('userId', '==', context.params.docId)
    const joinFields = ['displayName', 'photoURL'];
    await updateJoinData(change, queryRef, joinFields, 'user');

    // update regular counter doc
    await colCounter(change, context);
    return null;
  });

