export enum Role {
  Admin = "admin",
  Editor = "editor",
  Author = "author",
  Subscriber = "subscriber"
};

export interface UserRec {
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  role?: Role;
  uid?: string;
  username?: string;
  heartsCount?: number;
  draftsCount?: number;
  postsCount?: number;
  bookmarksCount?: number;
};
