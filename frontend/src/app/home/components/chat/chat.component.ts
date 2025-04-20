import { Component, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Conversation, Message } from '../../models';
import { ChatService } from '../../services/chat.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnDestroy {
  @ViewChild('form') form: NgForm;

  userFullImagePath: string;
  userId: number;

  conversations: Conversation[] = [];
  conversation: Conversation;

  messages: Message[] = [];
  friends: User[] = [];
  friend: User;
  friend$ = new BehaviorSubject<User | null>(null);

  selectedConversationIndex = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService
  ) {}

  ionViewDidEnter() {
    this.subscribeToUserDetails();
    this.subscribeToConversations();
    this.subscribeToMessages();
    this.subscribeToNewMessages();
    this.subscribeToFriends();
    this.subscribeToFriendChanges();
  }

  onSubmit() {
    const { message } = this.form.value;
    if (!message) {
      return;
    }

    const conversationUserIds = [this.userId, this.friend.id].sort();

    this.conversation = this.conversations.find((conversation) => {
      const userIds = conversation.users.map((user) => user.id).sort();
      return JSON.stringify(conversationUserIds) === JSON.stringify(userIds);
    });

    this.chatService.sendMessage(message, this.conversation);
    this.form.reset();
  }

  openConversation(friend: User, index: number): void {
    this.selectedConversationIndex = index;

    this.chatService.leaveConversation();

    this.friend = friend;
    this.friend$.next(this.friend);

    this.messages = [];
  }

  deriveFullImagePath(user: User): string {
    const url = `${environment.baseApiUrl}/feed/image/`;

    if (user.id === this.userId) {
      return this.userFullImagePath;
    }

    return user.imagePath
      ? url + user.imagePath
      : url + 'blank-profile-picture.png';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToUserDetails() {
    this.authService.userFullImagePath.pipe(takeUntil(this.destroy$))
      .subscribe((path) => {
        this.userFullImagePath = path;
      });

    this.authService.userId.pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.userId = id;
      });
  }

  private subscribeToConversations() {
    this.chatService.getConversations()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((conversations) => {
        this.conversations.push(conversations[0]);
      });
  }

  private subscribeToMessages() {
    this.chatService.getConversationMessages()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((messages) => {
        this.addUniqueMessages(messages);
      });
  }

  private subscribeToNewMessages() {
    this.chatService.getNewMessage()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((message) => {
        message.createdAt = new Date();
        this.addUniqueMessages([message]);
      });
  }

  private subscribeToFriends() {
    this.chatService.getFriends()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((friends) => {
        this.friends = friends;

        if (friends.length > 0) {
          this.friend = friends[0];
          this.friend$.next(this.friend);

          friends.forEach((friend) => this.chatService.createConversation(friend));
          this.chatService.joinConversation(this.friend.id);
        }
      });
  }

  private subscribeToFriendChanges() {
    this.friend$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((friend) => {
        if (JSON.stringify(friend) !== '{}') {
          this.chatService.joinConversation(this.friend.id);
        }
      });
  }

  private addUniqueMessages(newMessages: Message[]) {
    const existingMessageIds = new Set(this.messages.map((msg) => msg.id));

    newMessages.forEach((msg) => {
      if (!existingMessageIds.has(msg.id)) {
        this.messages.push(msg);
        existingMessageIds.add(msg.id);
      }
    });
  }
}
