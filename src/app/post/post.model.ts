import { UserRec } from '../auth/user.model';

export type PostType = 'bookmarks' | 'liked' | 'updated' | 'user' | 'drafts' | 'new' | 'tag' | null;

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

export interface PostInput {
  sortField?: string,
  sortDirection?: 'desc' | 'asc',
  tag?: string,
  uid?: string,
  authorId?: string,
  field?: string,
  page?: number,
  pageSize?: number,
  drafts?: boolean
};
  
