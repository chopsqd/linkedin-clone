import { FeedPostEntity } from "../../feed/models/post.entity";
import { FriendRequest } from "./friend-request.interface";
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
  sentFriendRequests: FriendRequest[]
  receivedFriendRequests: FriendRequest[]
}

export type UserSafe = Omit<User, "password">