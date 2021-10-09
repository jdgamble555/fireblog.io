export enum Role {
  Admin = "admin",
  Editor = "editor",
  User = "user",
  Subscriber = "subscriber"
};

export interface User {
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  role: Role
};
