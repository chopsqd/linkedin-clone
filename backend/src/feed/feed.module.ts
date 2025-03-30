import {Module} from '@nestjs/common';
import {FeedController} from './controllers/feed.controller';
import {FeedService} from './services/feed.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {FeedPostEntity} from "./models/post.entity";

@Module({
    imports: [TypeOrmModule.forFeature([FeedPostEntity])],
    controllers: [FeedController],
    providers: [FeedService]
})
export class FeedModule {}
