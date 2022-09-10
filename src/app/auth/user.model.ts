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
  createdAt?: Date;
  updatedAt?: Date;
};

export interface UserAuth {
  uid: string;
  email: string;
  displayName?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  emailVerified: boolean | null;
}

export interface AuthAction {
  reAuth?: boolean | null;
  isNew?: boolean | null;
  isConfirmed?: boolean | null;
  error: string | null;
  message: string | null;
}
