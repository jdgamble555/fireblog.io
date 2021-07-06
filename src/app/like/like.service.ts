import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { EMPTY } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface Like {
  userId: string;
  postId: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  constructor(private afs: AngularFirestore, private auth: AuthService) { }

  // Check if user likes the doc
  getLike(userId: string, postId: string) {

    // create like path
    const likePath = this.createPath(userId, postId);

    // don't look for a doc that won't exist
    if (userId === this.auth.uid$) {
      return this.afs.doc(likePath).valueChanges();
    }
    return EMPTY;
  }

  // Get all likes that belong to a user
  getUserLikes(userId: string) {
    const likesRef = this.afs.collection('likes', ref => ref.where('userId', '==', userId));
    return likesRef.valueChanges();
  }

  // Get all likes that belong to a post
  getPostLikes(postId: string) {
    const likesRef = this.afs.collection('likes', ref => ref.where('postId', '==', postId));
    return likesRef.valueChanges();
  }

  // Create or update like
  setLike(userId: string, postId: string) {

    // Like document data
    const like: Like = { userId, postId, createdAt: new Date() };

    // create like path
    const likePath = this.createPath(userId, postId);

    // Set the data, return the promise
    return this.afs.doc(likePath).set(like);
  }

  removeLike(userId: string, postId: string) {

    // create like path
    const likePath = this.createPath(userId, postId);

    return this.afs.doc(likePath).delete();
  }

  createPath(userId: string, postId: string) {

    // Custom doc ID for relationship
    return `likes/${userId}_${postId}`;
  }

}
