export interface User {
  displayName?: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  roles?: any;
  uid: string;
}

export interface Providers {
  password?: boolean;
  google?: boolean;
  facebook?: boolean;
  twitter?: boolean;
  github?: boolean;
  microsoft?: boolean;
  yahoo?: boolean;
}

export interface Roles {
  subscriber?: boolean;
  editor?: boolean;
  admin?: boolean;
}

export interface EmailPasswordCredentials {
  email: string;
  password: string;
  displayName: string;
}
