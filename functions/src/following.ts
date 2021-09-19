import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
try {
  admin.initializeApp();
} catch (e) { }
import { arrayIndex } from "adv-firestore-functions";

exports = module.exports = functions.firestore
  .document("users/{userId}/following/{followingId}")
  .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {

    await arrayIndex(change, context, {
      max: 5,
      docSortField: "createdAt",
      docSortType: "id",
      type: "array"
    });

  });


