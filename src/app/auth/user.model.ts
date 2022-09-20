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
  emailVerified?: boolean;
  providers?: string[];
};

export interface AuthAction {
  reAuth?: boolean | null;
  isNew?: boolean | null;
  isConfirmed?: boolean | null;
  error: any;
}

export interface UserRequest {
  error: any,
  data?: UserRec | null;
  exists?: boolean | null;
}
