import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
try { admin.initializeApp(); } catch (e) { }
import {
    colCounter,
    subCatCounter,
    eventExists,
    getFriendlyURL,
    isTriggerFunction,
    triggerFunction,
    valueChange,
    uniqueField,
    getValue
} from 'adv-firestore-functions';

exports = module.exports = functions.firestore
    .document('categories/{categoryId}')
    .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext): Promise<void> => {

        // don't run if repeated function
        if (await eventExists(context) || isTriggerFunction(change, context)) {
            return;
        }
        console.log("First function run: ", context.eventId);

        // get category variables
        const parent = getValue(change, 'parent');
        const title = getValue(change, 'title');

        // create catPath
        const catPath = parent + '/' + getFriendlyURL(title);

        // update catPath unique index
        await uniqueField(change, context, 'catPath', true, catPath, 'categoryId');

        // update all sub category counters
        await subCatCounter(change, context);

        // update regular counter on _counterDoc
        await colCounter(change, context);

        const data: any = {};

        // only update catPath if new or changed category
        if (valueChange(change, 'title') || valueChange(change, 'parent')) {
            data.catPath = catPath;
        }
        // run trigger function, if necessary
        await triggerFunction(change, data);
    });
