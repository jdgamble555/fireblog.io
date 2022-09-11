export const auth_settings_messages: any = {
  deleteAccount: 'Are you sure you want to delete your account?',
  selectImage: 'You must choose an image file type.'
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
