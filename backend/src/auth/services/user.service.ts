import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { from, map, Observable, of, switchMap } from "rxjs";
import { FriendRequest, FriendRequestStatus } from "../models/friend-request.interface";
import { FriendRequestEntity } from "../models/friend-request.entity";
import { User, UserSafe } from "../models/user.class";
import { UserEntity } from "../models/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>
  ) {}

  findUserById(id: number): Observable<UserSafe> {
    return from(
      this.userRepository.findOne({ id }, { relations: ["feedPosts"] })
    ).pipe(
      map((user: User) => {
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword;
      })
    );
  }

  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    const user: User = new UserEntity();

    user.id = id;
    user.imagePath = imagePath;

    return from(
      this.userRepository.update(id, user)
    );
  }

  findImageNameByUserId(id: number): Observable<string> {
    return from(
      this.userRepository.findOne({ id })
    ).pipe(
      map(({ password, ...userWithoutPassword }: User) => userWithoutPassword.imagePath)
    );
  }

  private hasRequestBeenSentOrReceived(creator: User, receiver: User): Observable<boolean> {
    return from(
      this.friendRequestRepository.findOne({
        where: [
          { creator, receiver },
          { creator: receiver, receiver: creator }
        ]
      })
    ).pipe(
      map((friendRequest: FriendRequest | undefined) => !!friendRequest)
    );
  }

  sendFriendRequest(receiverId: number, creator: User): Observable<FriendRequest | { error: string }> {
    if (receiverId === creator.id) {
      return of({ error: "It is not possible to add yourself!" });
    }

    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) =>
        this.hasRequestBeenSentOrReceived(creator, receiver).pipe(
          switchMap((hasRequestBeenSentOrReceived: boolean) => {
            if (hasRequestBeenSentOrReceived) {
              return of({ error: "A friend request has already been sent or received to your account!" });
            }

            const friendRequest: Omit<FriendRequest, "id"> = {
              creator,
              receiver,
              status: "pending"
            };

            return from(this.friendRequestRepository.save(friendRequest));
          })
        )
      )
    );
  }

  getFriendRequestStatus(receiverId: number, currentUser: User): Observable<{ status: FriendRequestStatus }> {
    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) =>
        from(
          this.friendRequestRepository.findOne({
            where: [
              { creator: currentUser, receiver },
              { creator: receiver, receiver: currentUser }
            ],
            relations: ["creator", "receiver"]
          })
        )
      ),
      map((friendRequest: FriendRequest | undefined) => {
        if (friendRequest?.receiver.id === currentUser.id) {
          return { status: "waiting-for-current-user-response" };
        }
        return { status: friendRequest?.status || "not-sent" };
      })
    );
  }

  private getFriendRequestUserById(friendRequestId: number): Observable<FriendRequest> {
    return from(
      this.friendRequestRepository.findOne({
        where: { id: friendRequestId }
      })
    ).pipe(
      map((friendRequest) => {
        if (!friendRequest) {
          throw new Error("Friend request not found");
        }
        return friendRequest;
      })
    );
  }

  respondToFriendRequest(
    statusResponse: FriendRequestStatus,
    friendRequestId: number
  ): Observable<{ status: FriendRequestStatus }> {
    return this.getFriendRequestUserById(friendRequestId).pipe(
      switchMap((friendRequest: FriendRequest) =>
        from(
          this.friendRequestRepository.save({
            ...friendRequest,
            status: statusResponse
          })
        )
      ),
      map((updatedFriendRequest: FriendRequest) => ({
        status: updatedFriendRequest.status
      }))
    );
  }

  getFriendRequestsFromRecipients(currentUser: User): Observable<FriendRequest[]> {
    return from(
      this.friendRequestRepository.find({
        where: { receiver: currentUser },
        relations: ["receiver", "creator"]
      })
    );
  }

  private extractFriendUserIds(friends: FriendRequest[], currentUser: User): number[] {
    return friends.flatMap((friend) =>
      friend.creator.id === currentUser.id ? [friend.receiver.id] : [friend.creator.id]
    );
  }

  getFriends(currentUser: User): Observable<User[]> {
    return from(
      this.friendRequestRepository.find({
        where: [
          { creator: currentUser, status: "accepted" },
          { receiver: currentUser, status: "accepted" }
        ],
        relations: ["creator", "receiver"]
      })
    ).pipe(
      switchMap((friends: FriendRequest[]) => {
        const userIds = this.extractFriendUserIds(friends, currentUser);
        return from(this.userRepository.findByIds(userIds));
      })
    );
  }
}
