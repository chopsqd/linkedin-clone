import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import { FeedService } from "../services/feed.service";
import { User } from "../../auth/models/user.interface";
import { map, Observable, switchMap } from "rxjs";
import { FeedPost } from "../models/post.interface";

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
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

    return this.authService.findUserById(user.id).pipe(
      switchMap((user: User) => this.feedService.findPostById(params.id).pipe(
        map((feedPost: FeedPost) => user.id === feedPost?.author.id)
      ))
    )
  }
}
