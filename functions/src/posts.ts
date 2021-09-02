import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
try {
  admin.initializeApp();
} catch (e) { }
import {
  colCounter,
  queryCounter,
  eventExists,
  uniqueField,
  getCatArray,
  isTriggerFunction,
  valueChange,
  triggerFunction,
  tagIndex,
  catDocCounter,
  getValue,
  aggregateData,
  getJoinData,
  trigramIndex
} from "adv-firestore-functions";

const db = admin.firestore();

exports = module.exports = functions.firestore
  .document("posts/{docId}")
  .onWrite(
    async (
      change: functions.Change<functions.firestore.DocumentSnapshot>,
      context: functions.EventContext
    ) => {
      // don't run if repeated function
      if ((await eventExists(context)) || isTriggerFunction(change, context)) {
        return null;
      }
      console.log("First function run: ", context.eventId);

      // index the posts
      await trigramIndex(change, context, {
        fields: ["content", "tags", "summary", "title"]
      });

      // variables to use
      const category = getValue(change, "category") || "";
      const catArray = getCatArray(category);

      // index unique field name
      await uniqueField(change, context, "title", true);

      // index tags
      await tagIndex(change, context, undefined, "tags");

      // create categoryDoc - TODO - and root doc?
      if (category !== "") {
        const categoryDocs = await db
          .collection("categories")
          .where("catPath", "==", category)
          .get();
        const categoryDoc = categoryDocs.docs[categoryDocs.size - 1].ref;

        // aggregateData
        const queryRef = db.collection("posts").orderBy("createdAt", "desc");
        const exemptFields = ["catArray", "category"];

        await aggregateData(
          change,
          context,
          categoryDoc,
          queryRef,
          exemptFields
        );
      }
      // postsCount on usersDoc
      const userRef = getValue(change, "userDoc");
      const postsQuery = db.collection("posts").where("userDoc", "==", userRef);
      await queryCounter(change, context, postsQuery, userRef);

      // postsCount on categories and its subcategories
      await catDocCounter(change, context);

      // update regular counter doc
      await colCounter(change, context);

      // only join fields on create / user function handles the rest
      const joinFields = ["displayName", "photoURL"];
      const data = await getJoinData(change, userRef, joinFields, "user");

      // only update catArray if category has changed
      if (valueChange(change, "category")) {
        data.catArray = catArray;
      }
      await triggerFunction(change, data);

      return null;
    }
  );
