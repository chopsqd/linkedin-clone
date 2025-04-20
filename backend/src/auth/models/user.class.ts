import { FeedPostEntity } from "../../feed/models/post.entity";
import { Role } from "./role.enum";
import { IsEmail, IsString } from "class-validator";

export class User {
  id: number;
  firstName: string;
  lastName: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  imagePath: string;
  role: Role;
  feedPosts: FeedPostEntity[];
}

export type UserSafe = Omit<User, "password">