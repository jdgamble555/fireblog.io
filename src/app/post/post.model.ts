import { UserRec } from '../auth/user.model';

export interface Post {
  id?: string;
  title?: string;
  authorId?: string;
  content?: string;
  image?: string | null;
  imageTmp?: string;
  imageUploads?: string[];
  createdAt?: Date | any;
  updatedAt?: Date | any;
  tags?: any;
  slug?: string;
  minutes?: string;
  authorDoc?: UserRec | any;
  published?: boolean;
  heartsCount?: number;
  bookmarksCount?: number;
  draftsCount?: number;
  liked?: boolean;
  saved?: boolean;
  _tmpDoc?: any;
}

export interface Tag {
  name?: string;
  count?: number;
}

