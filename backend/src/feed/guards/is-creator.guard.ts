import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { FeedService } from "../services/feed.service";
import { User } from "../../auth/models/user.class";
import { map, Observable, switchMap } from "rxjs";
import { FeedPost } from "../models/post.interface";
import { UserService } from "../../auth/services/user.service";

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly feedService: FeedService
  ) {}

  canActivate(context: ExecutionContext): Observable<boolean> | boolean {
    const request = context.switchToHttp().getRequest();
    const { user, params }: {user: User, params: { id: number } } = request

    if (!user || !params) {
      return false;
    }

    if (user.role === 'admin') {
      return true
    }

    return this.userService.findUserById(user.id).pipe(
      switchMap((user: User) => this.feedService.findPostById(params.id).pipe(
        map((feedPost: FeedPost) => user.id === feedPost?.author.id)
      ))
    )
  }
}
