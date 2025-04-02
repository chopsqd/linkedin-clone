import {Injectable} from '@nestjs/common';
import {DeleteResult, Repository, UpdateResult} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {from, Observable} from "rxjs";

import {FeedPostEntity} from "../models/post.entity";
import {FeedPost} from "../models/post.interface";

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(FeedPostEntity)
        private readonly feedPostRepository: Repository<FeedPostEntity>
    ) {
    }

    createPost(feedPost: FeedPost): Observable<FeedPost> {
        return from(this.feedPostRepository.save(feedPost))
    }

    findAllPosts(): Observable<FeedPost[]> {
        return from(this.feedPostRepository.find())
    }

    findPosts(take: number = 10, skip: number = 0): Observable<FeedPost[]> {
        return from(this.feedPostRepository.findAndCount({take, skip}).then(([posts]) => posts))
    }

    updatePost(id: number, feedPost: FeedPost): Observable<UpdateResult> {
        return from(this.feedPostRepository.update(id, feedPost))
    }

    deletePost(id: number): Observable<DeleteResult> {
        return from(this.feedPostRepository.delete(id))
    }
}
