import { User } from "./user.class";

export type FriendRequestStatus =
  | "not-sent"
  | "pending"
  | "accepted"
  | "declined"
  | "waiting-for-current-user-response";

export interface FriendRequest {
  id: number;
  creator: User;
  receiver: User;
  status: FriendRequestStatus;
}