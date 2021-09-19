import { User } from '../auth/user.model';

export interface Post {
  postID?: string;
  title?: string;
  authorId?: string;
  content?: string;
  image?: string | any;
  imageUploads?: string[] | any;
  createdAt?: Date | any;
  updatedAt?: Date | any;
  tags?: any;
  slug?: string;
  minutes?: string;
  authorDoc?: User | any;
  published?: boolean;
}

