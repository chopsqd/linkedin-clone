import { Post } from '../../home/models';

export type Role = 'admin' | 'premium' | 'user';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  imagePath: string;
  role: Role;
  posts: Post[];
}
