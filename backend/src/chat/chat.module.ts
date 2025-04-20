import { Module } from '@nestjs/common';
import { ChatGateway } from './gateway/chat/chat.gateway';
import { ConversationService } from './services/conversation.service';
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConversationEntity } from "./models/conversation.entity";
import { ActiveConversationEntity } from "./models/active-conversation.entity";
import { MessageEntity } from "./models/message.entity";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ConversationEntity,
      ActiveConversationEntity,
      MessageEntity
    ])
  ],
  providers: [ChatGateway, ConversationService]
})
export class ChatModule {}
