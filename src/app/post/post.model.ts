import firebase from 'firebase/app';
import { User } from '../auth/user.model';

export interface Post {
    id: string;
    title: string;
    authorId: string;
    content: string;
    summary: string;
    image: string;
    createdAt: Date | firebase.firestore.FieldValue | any;
    updatedAt: Date | firebase.firestore.FieldValue | any;
    tags?: any;
    slug?: string;
    count?: string;
    author: User;
}

