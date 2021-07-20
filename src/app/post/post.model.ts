import { DocumentReference } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { User } from '../auth/user.model';

export interface Post {
    id?: string;
    title: string;
    authorId: string;
    content: string;
    image: string;
    createdAt?: Date | firebase.firestore.FieldValue | any;
    updatedAt?: Date | firebase.firestore.FieldValue | any;
    tags?: any;
    slug?: string;
    minutes?: string;
    authorDoc?: DocumentReference;
    author?: User;
}

