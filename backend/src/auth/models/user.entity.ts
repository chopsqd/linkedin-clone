import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.enum";
import { FeedPostEntity } from "../../feed/models/post.entity";
import { FriendRequestEntity } from "./friend-request.entity";

@Entity("user")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  imagePath: string;

  @Column({ type: "enum", enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => FeedPostEntity, (feedPostEntity) => feedPostEntity.author)
  feedPosts: FeedPostEntity[]

  @OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.creator)
  sentFriendRequests: FriendRequestEntity[]

  @OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.receiver)
  receivedFriendRequests: FriendRequestEntity[]
}