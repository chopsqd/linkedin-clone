import { Injectable } from "@nestjs/common";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { from, Observable } from "rxjs";

import { FeedPostEntity } from "../models/post.entity";
import { FeedPost } from "../models/post.interface";
import { User } from "../../auth/models/user.interface";

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPostEntity)
    private readonly feedPostRepository: Repository<FeedPostEntity>
  ) {}

  createPost(user: User, feedPost: FeedPost): Observable<FeedPost> {
    feedPost.author = user;
    return from(this.feedPostRepository.save(feedPost));
  }

  // findPosts(take: number = 10, skip: number = 0): Observable<FeedPost[]> {
  //   return from(this.feedPostRepository.findAndCount({ take, skip }).then(([posts]) => posts));
  // }

  findPosts(take: number = 10, skip: number = 0): Observable<FeedPost[]> {
    return from(
      this.feedPostRepository
        .createQueryBuilder('post')
        .innerJoinAndSelect('post.author', 'author')
        .orderBy('post.createdAt', 'DESC')
        .take(take)
        .skip(skip)
        .getMany()
    );
  }

  findPostById(id: number): Observable<FeedPost | undefined> {
    return from(this.feedPostRepository.findOne({ id }, { relations: ['author'] }))
  }

  updatePost(id: number, feedPost: FeedPost): Observable<UpdateResult> {
    return from(this.feedPostRepository.update(id, feedPost));
  }

  deletePost(id: number): Observable<DeleteResult> {
    return from(this.feedPostRepository.delete(id));
  }
}
