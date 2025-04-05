import { Module } from "@nestjs/common";
import { FeedController } from "./controllers/feed.controller";
import { FeedService } from "./services/feed.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedPostEntity } from "./models/post.entity";
import { AuthModule } from "../auth/auth.module";
import { IsCreatorGuard } from "./guards/is-creator.guard";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([FeedPostEntity])],
  controllers: [FeedController],
  providers: [FeedService, IsCreatorGuard]
})
export class FeedModule {
}
