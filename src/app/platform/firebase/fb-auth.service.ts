import { Injectable } from '@angular/core';
import {
  Auth,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  getAdditionalUserInfo,
  OAuthProvider,
  linkWithPopup,
  unlink,
  updateEmail,
  updatePassword,
  reauthenticateWithPopup,
  User,
  user
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { Role } from 'src/app/auth/user.model';
import { DbService } from '../mock/db.service';


@Injectable({
  providedIn: 'root'
})
export class FbAuthService {

  user$: Observable<User | null>;

  private messages = {
    accountRemoved: 'Your account has been deleted and you have been logged out.',
    emailUpdated: 'Your Email Address has been updated.',
    emailVerifySent: 'A verification email has been sent.',
    passUpdated: 'Your Password has been updated.',
    profileUpdated: 'Your Profile has been updated.',
    providerRemoved: '{0} has been removed from the account.',
    resetPassword: 'Your password reset link has been sent.'
  };

  private errors = {
    removeProvider: 'You must have at least one linked account or password.',
    updateProfile: 'Your profile could not be updated.'
  };

  constructor(private auth: Auth, private db: DbService) {
    this.user$ = user(auth);
  }

  async getUser(): Promise<User | null> {
    return await this.user$.pipe(take(1)).toPromise();
  }

  //
  // Login
  //

  async emailLogin(email: string, password: string): Promise<any> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async emailSignUp(email: string, password: string): Promise<void> {

    // create user, add name, send email verification
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);

    if (credential.user) {

      await updateProfile(credential.user, { displayName: credential.user.displayName });
      await sendEmailVerification(credential.user);

      const userData = {
        email,
        role: Role.Author
      };

      // create user in db
      await this.db.createUser(userData, credential.user.uid);
    }
  }

  async resetPassword(email: string): Promise<any> {

    // sends reset password email
    await sendPasswordResetEmail(this.auth, email);
    return { message: this.messages.resetPassword };
  }

  async oAuthLogin(p: string): Promise<void> {

    // get provider, sign in
    const provider = new OAuthProvider(p);
    const credential = await signInWithPopup(this.auth, provider);
    const additionalInfo = getAdditionalUserInfo(credential);

    // create user in db
    if (additionalInfo?.isNewUser) {
      const userData = {
        displayName: credential.user.displayName,
        email: credential.user.email,
        phoneNumber: credential.user.phoneNumber,
        photoURL: credential.user.photoURL,
        role: Role.Author
      };
      return await this.db.createUser(userData, credential.user.uid);
    }
  }

  async oAuthReLogin(p: string): Promise<any> {
    const provider = new OAuthProvider(p);
    const user = await this.getUser();
    if (user) {
      return reauthenticateWithPopup(user, provider);
    }
  }

  logout(): void {
    signOut(this.auth);
  }

  //
  // Providers
  //

  async getProviders(): Promise<any[]> {
    const user = await this.getUser();
    return user?.providerData
      .map((p: any) => p.providerId) || [];
  }

  async addProvider(p: string): Promise<any> {

    // get provider object from id
    const provider = new OAuthProvider(p);
    const user = await this.getUser();

    if (user) {
      const credential = await linkWithPopup(user, provider);

      // get new provider info
      const newProvider = credential.user!.providerData[0];

      // update photoURL and phoneNumber if null
      const photoURL = credential.user!.photoURL || newProvider!.photoURL;
      const phoneNumber = credential.user!.phoneNumber || newProvider!.phoneNumber;

      // update db
      await this.db.updateUser({ phoneNumber, photoURL }, credential.user.uid);
    }
  }

  async removeProvider(p: string): Promise<any> {

    // can't remove if only provider
    const providers = await this.getProviders();
    if (providers.length < 2) {
      throw this.errors.removeProvider;
    }
    const user = await this.getUser();

    // remove provider from firebase auth
    if (user) {
      await unlink(user, p);
      return { message: this.replaceMsg(this.messages.providerRemoved, p) };
    }
  }

  //
  // Profile
  //

  async updateEmail(email: string): Promise<any> {

    // update in firebase authentication
    const user = await this.getUser();

    if (user) {
      await updateEmail(user, email);
      await this.db.updateUser({ email }, user.uid);
      await sendEmailVerification(user);
      return { message: this.messages.emailUpdated };
    }
    throw this.errors.updateProfile;
  }

  async sendVerificationEmail() {

    // update in firebase authentication
    const user = await this.getUser();

    if (user) {
      await sendEmailVerification(user);
      this.logout();
    }
  }

  async updatePass(pass: string): Promise<any> {
    // update in firebase authentication
    const user = await this.getUser();
    if (user) {
      await updatePassword(user, pass);
      return { message: this.messages.passUpdated };
    }
    throw this.errors.updateProfile;
  }

  async updateProfile(profile: {
    displayName?: string | null | undefined;
    photoURL?: string | null | undefined;
  }): Promise<any> {
    // update in firebase authentication
    const user = await this.getUser();

    if (user) {
      await updateProfile(user, profile);
      await this.db.updateUser(profile, user.uid);
      return { message: this.messages.profileUpdated };
    }
    throw this.errors.updateProfile;
  }

  async deleteUser(): Promise<any> {
    // delete user from firebase authentication
    const user = await this.getUser();
    if (user) {
      await user.delete();
      await this.db.deleteUser(user.uid);
      return { message: this.messages.accountRemoved };
    }
    throw this.errors.updateProfile;
  }

  //
  // Tools
  //

  /**
   * Replaces variables and shows a message
   * @param msg message with {0} in it
   * @param v variable to replace
   */
  private replaceMsg(msg: string, v: string): string {
    const sFormat = (str: string, ...args: string[]) => str.replace(/{(\d+)}/g, (undefined, index) => args[index] || '');
    return sFormat(msg, v);
  }
}
