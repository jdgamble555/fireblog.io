export const auth_messages = {
  accountRemoved: 'Your account has been deleted and you have been logged out.',
  emailUpdated: 'Your Email Address has been updated.',
  emailVerifySent: 'A verification email has been sent.',
  passUpdated: 'Your Password has been updated.',
  profileUpdated: 'Your Profile has been updated.',
  providerRemoved: '{0} has been removed from the account.',
  resetPassword: 'Your password reset link has been sent.',
  usernameUpdated: 'Your username has been updated!',
  sendEmailLink: 'Your email login link has been sent.',
  loginSuccess: 'You have been successfully logged in!',
  emailConfirm: 'Your email has been confirmed!'
};

export const auth_errors = {
  removeProvider: 'You must have at least one linked account or password.',
  updateProfile: 'Your profile could not be updated.'
};

export const replaceMsg = (msg: string, v: string): string => {
  const sFormat = (str: string, ...args: string[]) => str.replace(/{(\d+)}/g, ({ }, index) => args[index] || '');
  return sFormat(msg, v);
};
