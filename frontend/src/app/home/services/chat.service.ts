import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { User } from '../../auth/models/user.model';
import { ChatSocketService } from '../../core/chat-socket.service';
import { Conversation, Message } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    private readonly socket: ChatSocketService,
    private readonly http: HttpClient
  ) {}

  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.baseApiUrl}/user/friends/my`);
  }

  sendMessage(message: string, conversation: Conversation): void {
    const newMessage: Message = { message, conversation };
    this.socket.emit('sendMessage', newMessage);
  }

  getNewMessage(): Observable<Message> {
    return this.socket.fromEvent<Message>('newMessage');
  }

  createConversation(friend: User): void {
    this.socket.emit('createConversation', friend);
  }

  joinConversation(friendId: number): void {
    this.socket.emit('joinConversation', friendId);
  }

  leaveConversation(): void {
    this.socket.emit('leaveConversation');
  }

  getConversationMessages(): Observable<Message[]> {
    return this.socket.fromEvent<Message[]>('messages');
  }

  getConversations(): Observable<Conversation[]> {
    return this.socket.fromEvent<Conversation[]>('conversations');
  }
}
