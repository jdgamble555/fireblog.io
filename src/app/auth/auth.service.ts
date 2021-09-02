import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, shareReplay, map, take } from 'rxjs/operators';
import { User, EmailPasswordCredentials, Providers } from './user.model';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$!: Observable<User | null>;

  private messages: any = {
    accountRemoved: 'Your account has been deleted and you have been logged out.',
    emailUpdated: 'Your Email Address has been updated.',
    emailVerifySent: 'A verification email has been sent.',
    passUpdated: 'Your Password has been updated.',
    profileUpdated: 'Your Profile has been updated.',
    providerRemoved: '{0} has been removed from the account.',
    resetPassword: 'Your password reset link has been sent.'
  };

  private errors: any = {
    removeProvider: 'You must have at least one linked account or password.'
  };

  constructor(
    public afa: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    // get auth data, then get firestore user document || null
    this.user$ = this.afa.authState
      .pipe(
        shareReplay(),
        switchMap((user) => {
          return user
            ? this.afs.doc<User>(`users/${user.uid}`).snapshotChanges()
              .pipe(
                map((doc: Action<DocumentSnapshot<User>>) => {
                  // return id with doc
                  const data = doc.payload.data();
                  const uid = doc.payload.id;
                  return { uid, ...data } as User;
                })
              )
            : of(null);
        })
      );
  }
  /**
   * isLoggedIn
   * @returns - true or false
   */
  async isLoggedIn(): Promise<boolean> {
    return await new Promise((resolve: any, reject: any) =>
      this.afa.onAuthStateChanged((user) => {
        user ? resolve(true) : resolve(false);
      }, (e: any) => reject(e))
    );
  }
  /**
   * Get's current user
   * @returns False or User Info
   */
  async getUser(): Promise<User> {
    return new Observable((o: any) => {
      this.afa.onAuthStateChanged(o);
    }).pipe(take(1)).toPromise() as Promise<User>;
  }
  /**
   * Returns a hash of the user's providers
   * @returns a list of providers
   */
  async getProviders(): Promise<Providers> {
    return await new Promise((resolve: any, reject: any) =>
      this.afa.user.subscribe(async (user: firebase.User | null) => {
        if (user) {
          // make providers available
          const providers: any = { };
          user.providerData.forEach((provider: firebase.UserInfo | null) => {
            let id = provider!.providerId;
            providers[id] = true;
          });
          resolve(providers);
        }
      }, (e: any) => reject(e))
    );
  }
  /**
   * Returns the relevant provider object from a string
   * @param p - the provider id string
   * @returns the provider object
   */
  private getProvider(p: string): any {
    return new firebase.auth.OAuthProvider(p);
  }
  /**
   * Login with provider by popup and add it to firebase
   * @param p the oAuthLogin provider id
   * @returns UserCredential object
   */
  async addProvider(p: string): Promise<any> {

    // get provider object from id
    const provider = this.getProvider(p);

    const user = await this.afa.currentUser;

    return await user!
      .linkWithPopup(provider)
      .then((credential: firebase.auth.UserCredential) => {

        // get new provider info
        const newProvider = credential.user!.providerData[0];

        // update photoURL and phoneNumber if null
        const photoURL = credential.user!.photoURL || newProvider!.photoURL;
        const phoneNumber = credential.user!.phoneNumber || newProvider!.phoneNumber;

        // update firestore User document
        const userDef = { phoneNumber, photoURL };

        // update provider list
        return this.updateFirestoreDoc(userDef);
      });
  }
  /**
   * Removes a provider from firebase authentication
   * @param p the provider id
   */
  async removeProvider(p: string): Promise<any> {

    // can't remove if only provider
    const providers = this.getProviders();
    if (Object.keys(providers).length < 2) {
      return Promise.resolve(this.errors.removeProvider);
    }
    const user = await this.afa.currentUser;

    // remove provider from firebase auth
    return user!
      .unlink(p)
      .then(() => {
        return { message: this.replaceMsg(this.messages.providerRemoved, p) };
      });
  }
  /**
   * Re-authenticates with a popup
   * @param p provider string
   * @returns promise of reAuthentication
   */
  async oAuthReLogin(p: string): Promise<any> {
    const provider = this.getProvider(p);
    const user = await this.afa.currentUser;
    return user!.reauthenticateWithPopup(provider);
  }
  /**
   * Login with provider via popup,
   * update database, and sign in with angular
   * @param provider the oAuthLogin provider
   * @returns UserCredential object
   */
  async oAuthLogin(p: string): Promise<any> {

    // get provider object
    const provider = this.getProvider(p);

    return await this.afa
      .signInWithPopup(provider)
      .then((credential: firebase.auth.UserCredential | any) => {
        // add to db if first sign in
        if (credential.additionalUserInfo.isNewUser) {
          return this.addToDB(credential.user);
        }
        return null;
      });
  }
  /**
   * Login with email
   * @param credentials an email / password credential object
   * @returns UserCredential object
   */
  async emailLogin(credentials: EmailPasswordCredentials): Promise<any> {
    return await this.afa
      .signInWithEmailAndPassword(credentials.email, credentials.password);
  }
  /**
   * Reset Password
   * @param email user's email address
   */
  async resetPassword(email: string): Promise<any> {
    // sends reset password email
    return await this.afa
      .sendPasswordResetEmail(email)
      .then(() => {
        return { message: this.messages.resetPassword };
      });
  }
  /**
   * Sign up with Email Address
   * @param credentials an email / password credential object
   * @returns UserCredential object
   */
  async emailSignUp(credentials: EmailPasswordCredentials): Promise<any> {
    return await this.afa
      // create user
      .createUserWithEmailAndPassword(credentials.email, credentials.password)
      .then((credential: any) => {
        // add displayName to firebase
        return credential.user.updateProfile({ displayName: credentials.displayName })
          // send verification email
          .then(() => credential.user.sendEmailVerification())
          // add to db
          .then(() => this.addToDB(credential.user));
      });
  }
  /**
   * Delete Firestore User Doc
   * @param - uid - user id
  */
  private async delFromDB(uid: string): Promise<void> {
    const userRef = this.afs.doc(`users/${uid}`);
    return await userRef.delete();
  }
  /**
   * Creates Firestore User Doc
   * @param user the user data
   */
  private async addToDB(user: any): Promise<void> {

    // create the User doc
    const userDoc = {
      displayName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      roles: ['subscriber']
    };
    return this.updateFirestoreDoc(userDoc);
  }
  /**
   * Updates Firestore User Document
   * @param user the user data
   */
  private async updateFirestoreDoc(user: any): Promise<any> {

    // get User ID
    const u = await this.afa.currentUser;
    const uid = u?.uid;

    // get User doc
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${uid}`);

    // merge User doc with new information
    return userRef.set(user, { merge: true });
  }
  /**
   * Updates the user's display name and photo url
   * @param displayName the full name of a user
   * @param photoURL the url of a user's photo
   */
  async updateProfile(profile: any): Promise<any> {
    // update in firebase authentication
    const user: any = await this.afa.currentUser;
    return user.updateProfile(profile)
      // update in firestore database
      .then(() => this.updateFirestoreDoc(profile))
      .then(() => { return { message: this.messages.profileUpdated } });
  }
  /**
   * Sends a user verificaton email
   * @param msgFunction - message function
   */
  async sendVerificationEmail(): Promise<any> {
    const user = await this.afa.currentUser;
    // send verification email
    return user!.sendEmailVerification()
      .then(() => { return { message: this.messages.emailVerifySent } });
  }
  /**
   * Delete user from firebase authentication
   * and firestore database
   * @returns true if need to login again
   */
  async deleteUser(): Promise<any> {
    // delete user from firebase authentication
    const user = await this.afa.currentUser;
    return await user!
      .delete()
      .then(() =>
        // delete user from db
        this.delFromDB(user!.uid)
          .then(() => { return { message: this.messages.accountRemoved } })
      );
  }
  /**
   * Updates a user's password
   * @param pass password
   * @returns true if need to login again
   */
  async updatePass(pass: string): Promise<void> {
    // update in firebase authentication
    const user = await this.afa.currentUser;
    await user!
      .updatePassword(pass)
      .then(() => { return { message: this.messages.passUpdated }; });
  }
  /**
   * Updates a user's email address
   * @param email user's email address
   * @returns true if need to login again
   */
  async updateEmail(email: string): Promise<any> {

    // update in firebase authentication
    const user: any = await this.afa.currentUser;
    await user
      .updateEmail(email)
      // update in firestore database
      .then(() => this.updateFirestoreDoc({ email }))
      // send verification email
      .then(() => this.sendVerificationEmail())
      // return message
      .then(() => { return { message: this.messages.emailUpdated } });
  }
  /**
   * Sign a user out and navigate router to home "/"
   */
  async logout(): Promise<void> {
    await this.afa.signOut();
  }
  /**
   *
   * Role-based Authorization
   *
   *
   *
   * Check's the authorization of who can read the document
   * @param user the user document
   * @returns true if authorized
   */
  canRead(user: User): boolean {
    const allowed = ['admin', 'editor', 'subscriber'];
    return this.checkAuthorization(user, allowed);
  }
  /**
   * Check's the authorization of who can edit the document
   * @param user the user document
   * @returns true if authorized
   */
  canEdit(user: User): boolean {
    const allowed = ['admin', 'editor'];
    return this.checkAuthorization(user, allowed);
  }
  /**
   * Check's the authorization of who can delete the document
   * @param user the user document
   * @returns true if authorized
   */
  canDelete(user: User): boolean {
    const allowed = ['admin'];
    return this.checkAuthorization(user, allowed);
  }
  /**
   * Check the user authorizatoin
   * @param user the user document
   * @param allowedRoles the roles of the user to check
   * @returns true if authorized
   */
  private checkAuthorization(user: any, allowedRoles: string[]): boolean {
    if (!user) {
      return false;
    }
    for (const role of allowedRoles) {
      if (user.roles[role]) {
        return true;
      }
    }
    return false;
  }
  /**
   * Replaces variables and shows a message
   * @param msg message with {0} in it
   * @param v variable to replace
   */
  private replaceMsg(msg: string, v: string): string {
    const sFormat = (str: string, ...args: string[]) => str.replace(/{(\d+)}/g, (match, index) => args[index] || '');
    return sFormat(msg, v);
  }
}
