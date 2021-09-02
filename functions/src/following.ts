import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
try { admin.initializeApp(); } catch (e) { }
import { deleteDoc } from 'adv-firestore-functions';

const db = admin.firestore();

exports = module.exports = functions.firestore
  .document('users/{userId}/following/{followingId}')
  .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {

    await arrayIndex(change, context, {
      max: 5,
      docSortField: 'displayName'
    });

  });

export async function arrayIndex(
  change: functions.Change<functions.firestore.DocumentSnapshot>,
  context: functions.EventContext,
  _opts: {
    fieldToIndex?: string,
    max?: number,
    type?: 'array' | 'map',
    indexFieldName?: string,
    indexColName?: string,
    indexPath?: string,
    docToIndex?: string,
    docFieldsToIndex?: string | string[],
    docFieldName?: string,
    docSortField?: string,
    docSortType?: 'id' | 'value' | 'none'
  } = { }

) {

  const path = context.resource.name.split('/').splice(5);
  const parentDoc = path.slice(0, -2).join('/');
  const colName = path.slice(0, -1).pop() as string;
  const rootColName = path.slice(0, -3).join('/');
  const docId = path.pop();

  // define default options
  const opts = {
    fieldToIndex: _opts.fieldToIndex || 'id',
    max: _opts.max || 10000,
    type: _opts.type || 'array',
    indexFieldName: _opts.indexFieldName || colName,
    indexColName: _opts.indexColName || `${colName}_index`,
    indexPath: _opts.indexPath || parentDoc,
    docToIndex: _opts.docToIndex || parentDoc,
    docFieldsToIndex: _opts.docFieldsToIndex,
    docFieldName: _opts.docFieldName || rootColName,
    docSortField: _opts.docSortField || 'createdAt',
    docSortType: _opts.docSortType || 'none'
  };

  const indexColRef = db.collection(`${opts.indexPath}/${opts.indexColName}`);

  // get latest index doc
  const latest = (await indexColRef.orderBy('createdAt', 'desc').limit(1).get()).docs[0];

  console.log(latest.data())

  if (deleteDoc(change)) {

    // get data to be stored in field
    const fieldValue = opts.fieldToIndex === 'id'
      ? docId
      : (change.before.data() as any)[opts.fieldToIndex];

    // array or map type
    const deleteVal = opts.type === 'array'
      ? admin.firestore.FieldValue.arrayRemove(fieldValue)
      : { [fieldValue]: admin.firestore.FieldValue.delete() };

    console.log(`Removing ${fieldValue} index from ${opts.indexFieldName} on ${opts.indexColName}`);
    await indexColRef.doc(latest.id).update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      [opts.indexFieldName]: deleteVal
    });

  } else {

    // get data to be stored in field
    const fieldValue = opts.fieldToIndex === 'id'
      ? docId
      : (change.after.data() as any)[opts.fieldToIndex];

    // get size of storage field
    const field = (latest.data() as any)[opts.indexFieldName];
    const fieldLen = opts.type === 'array'
      ? (field as any[]).length
      : Object.keys(field).length;

    // create new doc if no doc or doc too big
    if (!latest.exists || fieldLen >= opts.max) {

      // aggregate data to doc
      let indexData = (await db.doc(opts.docToIndex).get()).data() as any;
      if (opts.docFieldsToIndex) {
        indexData = typeof opts.docFieldsToIndex === 'string'
          ? opts.docFieldsToIndex
          : indexData.filter((f: string) => f in (opts.docFieldsToIndex as string[]))
      }

      // array or map type
      const newVal = opts.type === 'array'
        ? [fieldValue]
        : { [fieldValue]: true };

      console.log(`Creating ${fieldValue} index for ${opts.indexFieldName} on ${opts.indexColName}`);
      await indexColRef.add({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        [opts.indexFieldName]: newVal,
        [opts.docFieldName]: indexData
      });
    } else {

      // array or map type
      const updateVal = opts.type === 'array'
        ? admin.firestore.FieldValue.arrayUnion(fieldValue)
        : { [fieldValue]: true };

      // add to existing doc
      console.log(`Updating ${fieldValue} index for ${opts.indexFieldName} on ${opts.indexColName}`);
      await indexColRef.doc(latest.id).update({
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        [opts.indexFieldName]: updateVal
      });
    }
  }
};
