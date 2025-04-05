import { FeedPostEntity } from "../../feed/models/post.entity";
import { Role } from "./role.enum";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  imagePath: string;
  role: Role;
  feedPosts: FeedPostEntity[];
}

export type UserSafe = Omit<User, "password">