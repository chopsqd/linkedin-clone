import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException, HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  Res,
  UseGuards
} from "@nestjs/common";
import { DeleteResult, UpdateResult } from "typeorm";
import { Observable } from "rxjs";
import { FeedService } from "../services/feed.service";
import { FeedPost } from "../models/post.interface";
import { JwtGuard } from "../../auth/guards/jwt.guard";
import { IsCreatorGuard } from "../guards/is-creator.guard";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // @Roles(Role.ADMIN, Role.PREMIUM)
  // @UseGuards(JwtGuard, RolesGuard)
  @UseGuards(JwtGuard)
  @Post()
  create(
    @Body() feedPost: FeedPost,
    @Request() req
  ): Observable<FeedPost> {
    return this.feedService.createPost(req.user, feedPost);
  }

  @UseGuards(JwtGuard)
  @Get()
  findSelected(
    @Query("take") take: number = 10,
    @Query("skip") skip: number = 0
  ): Observable<FeedPost[]> {
    return this.feedService.findPosts(Math.min(take, 20), skip);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Put(":id")
  update(
    @Param('id') id: number,
    @Body() feedPost: FeedPost
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, feedPost);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete(":id")
  delete(
    @Param('id') id: number
  ): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }

  @Get('image/:fileName')
  findImageByName(
    @Param('fileName') fileName: string,
    @Res() res
  ): Observable<Object> {
    if (!fileName || fileName === 'null' || fileName === '[null]') {
      throw new HttpException('File name is invalid', HttpStatus.BAD_REQUEST);
    }

    return res.sendFile(fileName, { root: './images' });
  }
}
