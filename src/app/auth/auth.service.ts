import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, shareReplay, map } from 'rxjs/operators';
import { User, EmailPasswordCredentials, Providers } from './user.model';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$!: Observable<User | null>;
  providers$!: Providers | any;
  uid$!: string | any;
  emailVerified$!: boolean | any;

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
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    // get auth data, then get firestore user document || null
    this.user$ = this.afAuth.authState
      .pipe(
        shareReplay(),
        switchMap((user) => {
          this.emailVerified$ = user?.emailVerified;
          return user
            ? this.afs.doc<User>(`users/${user.uid}`).snapshotChanges()
              .pipe(
                map((doc: Action<DocumentSnapshot<User>>) => {
                  // return id with doc
                  const data = doc.payload.data();
                  const uid = doc.payload.id;
                  this.uid$ = uid;
                  return { uid, ...data } as User;
                })
              )
            : of(null);
        })
      );
    // get list of providers to use in apps / uid
    this.getProviders();
  }
  /**
   * Gets the list of providers and sets them to this.providers$
   * -- Note: also gets uid
   */
  private getProviders(): void {
    this.afAuth.user.subscribe(user => {
      if (user) {
        this.uid$ = user.uid;
        // make providers available
        const providers: any = {};
        user.providerData.forEach(provider => {
          let id: any = provider?.providerId;
          // get rid of '.com' in name
          if (id.includes('.com')) {
            id = id.replace('.com', '');
          }
          providers[id] = true;
        });
        this.providers$ = providers;
      }
    });
  }
  /**
   * Returns the relevant provider object from a string
   * @param p the provider id string
   * @returns the provider object
   */
  private getProvider(p: string): any {

    const auth = firebase.auth;

    let provider;

    switch (p) {
      case ('google'): {
        provider = new auth.GoogleAuthProvider();
        break;
      }
      case ('twitter'): {
        provider = new auth.TwitterAuthProvider();
        break;
      }
      case ('facebook'): {
        provider = new auth.FacebookAuthProvider();
        break;
      }
      case ('github'): {
        provider = new auth.GithubAuthProvider();
        break;
      }
      case ('twitter'): {
        provider = new auth.TwitterAuthProvider();
        break;
      }
      case ('microsoft'): {
        provider = new auth.OAuthProvider('microsoft.com');
        break;
      }
      case ('yahoo'): {
        provider = new auth.OAuthProvider('yahoo.com');
        break;
      }
      case ('apple'): {
        provider = new auth.OAuthProvider('apple.com');
        break;
      }
    }
    return provider;
  }
  /**
   * Login with provider by popup and add it to firebase
   * @param p the oAuthLogin provider id
   * @returns UserCredential object
   */
  async addProvider(p: string): Promise<any> {

    // get provider object from id
    const provider = this.getProvider(p);

    const user = await this.afAuth.currentUser;

    return await user!
      .linkWithPopup(provider)
      .then((credential: any) => {

        // get new provider info
        const newProvider = credential.user.providerData[0];

        // update photoURL and phoneNumber if null
        const photoURL = credential.user.photoURL || newProvider.photoURL;
        const phoneNumber = credential.user.phoneNumber || newProvider.phoneNumber;

        // update firestore User document
        const userDef = {
          phoneNumber,
          photoURL
        };

        // update provider list
        this.getProviders();
        return this.updateFirestoreDoc(userDef);
      });
  }
  /**
   * Removes a provider from firebase authentication
   * @param p the provider id
   */
  async removeProvider(p: string): Promise<any> {

    // add .com to certain provider ids
    if (p === 'google' || p === 'microsoft' || p === 'yahoo') {
      p += '.com';
    }

    // can't remove if only provider
    if (Object.keys(this.providers$).length < 2) {
      return Promise.resolve(this.errors.removeProvider);
    }

    const user = await this.afAuth.currentUser;

    // remove provider from firebase auth
    return user!
      .unlink(p)
      // update provider list
      .then(() => this.getProviders())
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
    const user = await this.afAuth.currentUser;
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

    return await this.afAuth
      .signInWithPopup(provider)
      .then((credential: firebase.auth.UserCredential | any) => {
        // create firestore User doc if first sign in
        if (credential.additionalUserInfo.isNewUser) {
          return this.createFirestoreDoc(credential.user);
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
    return await this.afAuth
      .signInWithEmailAndPassword(credentials.email, credentials.password);
  }
  /**
   * Reset Password
   * @param email user's email address
   */
  async resetPassword(email: string): Promise<any> {
    // sends reset password email
    return await this.afAuth
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
    return await this.afAuth
      // create user
      .createUserWithEmailAndPassword(credentials.email, credentials.password)
      .then((credential: any) => {
        // add displayName to firebase
        return credential.user.updateProfile({ displayName: credentials.displayName })
          // send verification email
          .then(() => credential.user.sendEmailVerification())
          // create firestore User document
          .then(() => this.createFirestoreDoc(credential.user));
      });
  }
  /**
   * Creates Firestore User Document
   * @param user the user data
   */
  private async createFirestoreDoc(user: any): Promise<void> {

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
    const u = await this.afAuth.currentUser;
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
    const user: any = await this.afAuth.currentUser;
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
    const user = await this.afAuth.currentUser;
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
    const user = await this.afAuth.currentUser;
    await user!
      .delete()
      .then(async (): Promise<any> => {
        // delete user from firestore database
        const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user!.uid}`);
        return await userRef.delete()
          .then(() => { return { message: this.messages.accountRemoved } });
      });
  }
  /**
   * Updates a user's password
   * @param pass password
   * @returns true if need to login again
   */
  async updatePass(pass: string): Promise<void> {
    // update in firebase authentication
    const user = await this.afAuth.currentUser;
    await user!
      .updatePassword(pass)
      .then(() => {
        return { message: this.messages.passUpdated };
      });
  }
  /**
   * Updates a user's email address
   * @param email user's email address
   * @returns true if need to login again
   */
  async updateEmail(email: string): Promise<any> {

    // update in firebase authentication
    const user: any = await this.afAuth.currentUser;
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
  async signOut(): Promise<void> {
    await this.afAuth.signOut();
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
