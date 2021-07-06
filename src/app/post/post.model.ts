import { DocumentReference } from '@angular/fire/firestore'
import firebase from 'firebase/app';

export class Post {
    id?: string;
    title?: string;
    author?: string;
    authorId?: string;
    content?: string;
    summary?: string;
    image?: string;
    published?: Date | firebase.firestore.FieldValue;
    updated?: Date | firebase.firestore.FieldValue;
    _tags?: any;
    userDoc?: DocumentReference;
    titleURL?: string;
}
