import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { UseGuards } from "@nestjs/common";
import { Subscription, tap } from "rxjs";
import { Server, Socket } from "socket.io";

import { JwtGuard } from "src/auth/guards/jwt.guard";
import { User } from "src/auth/models/user.class";
import { AuthService } from "src/auth/services/auth.service";
import { ActiveConversation } from "../../models/active-conversation.interface";
import { Message } from "../../models/message.interface";
import { ConversationService } from "../../services/conversation.service";

@WebSocketGateway({ cors: { origin: ["http://localhost:8100"] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly authService: AuthService,
    private readonly conversationService: ConversationService
  ) {}

  @WebSocketServer()
  server: Server;

  private subscriptions: Subscription[] = [];

  @UseGuards(JwtGuard)
  handleConnection(socket: Socket) {
    console.log("HANDLE CONNECTION");
    const jwt = socket.handshake.headers.authorization || null;

    if (!jwt) {
      return this.handleDisconnect(socket);
    }

    this.authService.getJwtUser(jwt).subscribe({
      next: (user: User) => {
        if (!user) {
          console.log("No USER");
          this.handleDisconnect(socket);
        } else {
          socket.data.user = user;
          this.loadConversations(socket, user.id);
        }
      },
      error: () => this.handleDisconnect(socket)
    });
  }

  handleDisconnect(socket: Socket) {
    console.log("HANDLE DISCONNECT");
    this.leaveConversation(socket.id);
  }

  private loadConversations(socket: Socket, userId: number) {
    this.subscriptions.push(
      this.conversationService
        .getConversationsWithUsers(userId)
        .subscribe((conversations) =>
          this.server.to(socket.id).emit("conversations", conversations)
        )
    );
  }

  @SubscribeMessage("createConversation")
  createConversation(socket: Socket, friend: User) {
    this.subscriptions.push(
      this.conversationService
        .createConversation(socket.data.user, friend)
        .subscribe(() => this.loadConversations(socket, socket.data.user.id))
    );
  }

  @SubscribeMessage("sendMessage")
  handleMessage(socket: Socket, newMessage: Message) {
    if (!newMessage.conversation?.id) {
      console.warn("Conversation ID is undefined for newMessage:", newMessage);
      return;
    }

    const { user } = socket.data;
    newMessage.user = user;

    this.subscriptions.push(
      this.conversationService.createMessage(newMessage).subscribe((message) => {
        newMessage.id = message.id;

        this.subscriptions.push(
          this.conversationService
            .getActiveUsers(newMessage.conversation.id as number)
            .subscribe((activeConversations: ActiveConversation[]) => {
              activeConversations.forEach(({ socketId }) => {
                if (!socketId) {
                  console.warn("Socket ID is undefined for active conversation");
                  return;
                }
                this.server.to(socketId).emit("newMessage", newMessage);
              });
            })
        );
      })
    );
  }

  @SubscribeMessage("joinConversation")
  joinConversation(socket: Socket, friendId: number) {
    this.subscriptions.push(
      this.conversationService
        .joinConversation(friendId, socket.data.user.id, socket.id)
        .pipe(
          tap((activeConversation: ActiveConversation | null) => {
            if (!activeConversation?.conversationId) {
              console.warn("Conversation ID is undefined for active conversation:", activeConversation);
              return;
            }

            this.subscriptions.push(
              this.conversationService
                .getMessages(activeConversation.conversationId)
                .subscribe((messages: Message[]) =>
                  this.server.to(socket.id).emit("messages", messages)
                )
            );
          })
        )
        .subscribe()
    );
  }

  @SubscribeMessage("leaveConversation")
  leaveConversation(socketId: string) {
    this.subscriptions.push(
      this.conversationService.leaveConversation(socketId).subscribe()
    );
  }

  cleanupSubscriptions() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}