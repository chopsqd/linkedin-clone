export type FriendRequestStatus =
  | "not-sent"
  | "pending"
  | "accepted"
  | "declined"
  | "waiting-for-current-user-response";

export interface FriendRequest {
  id: number;
  creatorId: number;
  receiverId: number;
  status: FriendRequestStatus;
}
