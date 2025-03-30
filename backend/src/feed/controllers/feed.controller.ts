import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {DeleteResult, UpdateResult} from "typeorm";
import {Observable} from "rxjs";
import {FeedService} from "../services/feed.service";
import {FeedPost} from "../models/post.interface";

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    @Post()
    create(
        @Body() feedPost: FeedPost
    ): Observable<FeedPost> {
        return this.feedService.createPost(feedPost)
    }

    @Get()
    findAll(): Observable<FeedPost[]> {
        return this.feedService.findAllPosts()
    }

    @Put(':id')
    update(
        @Param() id: number,
        @Body() feedPost: FeedPost
    ): Observable<UpdateResult> {
        return this.feedService.updatePost(id, feedPost)
    }

    @Delete(':id')
    delete(
        @Param() id: number
    ): Observable<DeleteResult> {
        return this.feedService.deletePost(id)
    }
}
