import { User } from '../../auth/models/user.model';

export interface Post {
  id: number;
  body: string;
  createdAt: Date;
  author: User;
}
