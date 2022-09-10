export const auth_validation_messages: any = {
  email: {
    required: 'Email is required.',
    email: 'Email must be a valid email address.'
  },
  password: {
    required: 'Password is required.',
    pattern: 'Password must include at least one letter and one number.',
    minlength: 'Password must be at least 6 characters long.',
    maxlength: 'Password cannot be more than 25 characters long.'
  },
  confirmPassword: {
    required: 'Confirm password is required.',
    matching: 'Passwords must match.'
  },
  username: {
    required: 'A valid username is required.',
    minlength: 'Username must be at least 3 characters long.',
    maxlength: 'Username cannot be more than 25 characters long.',
    unavailable: 'That username is taken.'
  }
};
