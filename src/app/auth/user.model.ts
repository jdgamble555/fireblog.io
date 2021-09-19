export enum Role {
  User = "user",
  Admin = "admin"
};

export interface User {
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  photoURL?: string | null;
  role: Role
};
