export const post_form_validation_messages: any = {
  title: {
    required: 'Title is required.',
    minlength: 'Title must be at least 2 characters long.'
  },
  content: {
    required: 'Content is required.',
    minlength: 'Content must be at least 3 characters long.'
  },
  tags: {
    required: 'At least one tag is required.',
    min: 'You cannot have more than 5 tags.'
  }
};

export const post_form_messages: any = {
  published: 'Your post is now published!',
  deleted: 'Your post is now deleted!',
  deleteConfirm: 'Are you sure you want to delete your post?'
};
