export const auth_settings_messages = {
  deleteAccount: 'Are you sure you want to delete your account?',
  selectImage: 'You must choose an image file type.',
  usernameUpdated: 'Your username has been successfully updated!',
  profileUpdated: 'Your Profile has been updated.',
  providerRemoved: '{0} has been removed from the account.',
  passUpdated: 'Your Password has been updated.',
  emailUpdated: 'Your Email Address has been updated.',
  accountRemoved: 'Your account has been deleted and you have been logged out.',
  emailVerifySent: 'A verification email has been sent.',
};

export const auth_settings_validation_messages: any = {
  email: {
    required: 'Email is required.',
    email: 'Email must be a valid email address.'
  },
  password: {
    required: 'New Password is required.',
    pattern: 'New Password must include at least one letter and one number.',
    minlength: 'New Password must be at least 6 characters long.',
    maxlength: 'New Password cannot be more than 25 characters long.'
  },
  confirmPassword: {
    required: 'Confirm New Password is required.',
    matching: 'Passwords must match.'
  },
  displayName: {
    required: 'Name is required.'
  }
};

export const auth_settings_errors = {
  removeProvider: 'You must have at least one linked account or password.',
  updateProfile: 'Your profile could not be updated.'
};

// replace {} with input in message
export const replaceMsg = (msg: string, v: string): string => {
  const sFormat = (str: string, ...args: string[]) => str.replace(/{(\d+)}/g, ({ }, index) => args[index] || '');
  return sFormat(msg, v);
};
