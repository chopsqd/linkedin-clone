import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, switchMap, mergeMap } from 'rxjs';
import { User } from 'src/auth/models/user.class';
import { DeleteResult, Repository } from 'typeorm';
import { ActiveConversationEntity } from '../models/active-conversation.entity';
import { ActiveConversation } from '../models/active-conversation.interface';
import { ConversationEntity } from '../models/conversation.entity';
import { Conversation } from '../models/conversation.interface';
import { MessageEntity } from '../models/message.entity';
import { Message } from '../models/message.interface';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(ActiveConversationEntity)
    private readonly activeConversationRepository: Repository<ActiveConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  getConversation(creatorId: number, friendId: number): Observable<Conversation | undefined> {
    return from(
      this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.users', 'user')
        .where('user.id IN (:...ids)', { ids: [creatorId, friendId] })
        .having('COUNT(user.id) = 2')
        .getOne(),
    );
  }

  createConversation(creator: User, friend: User): Observable<Conversation> {
    return this.getConversation(creator.id, friend.id).pipe(
      switchMap((conversation) => {
        if (!conversation) {
          const newConversation: Conversation = { users: [creator, friend] };
          return from(this.conversationRepository.save(newConversation));
        }
        return of(conversation);
      })
    );
  }

  getConversationsForUser(userId: number): Observable<Conversation[]> {
    return from(
      this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.users', 'user')
        .where('user.id = :userId', { userId })
        .orderBy('conversation.lastUpdated', 'DESC')
        .getMany()
    );
  }

  getUsersInConversation(conversationId: number): Observable<Conversation[]> {
    return from(
      this.conversationRepository
        .createQueryBuilder('conversation')
        .innerJoinAndSelect('conversation.users', 'user')
        .where('conversation.id = :conversationId', { conversationId })
        .getMany()
    );
  }

  getConversationsWithUsers(userId: number): Observable<Conversation[]> {
    return this.getConversationsForUser(userId).pipe(
      switchMap((conversations: Conversation[]) =>
        from(conversations).pipe(
          mergeMap((conversation: Conversation) => {
            if (!conversation.id) {
              console.warn(`Conversation ID is undefined for conversation:`, conversation);
              return of([]);
            }
            return this.getUsersInConversation(conversation.id);
          })
        )
      )
    );
  }

  joinConversation(friendId: number, userId: number, socketId: string): Observable<ActiveConversation | null> {
    return this.getConversation(userId, friendId).pipe(
      switchMap((conversation) => {
        if (!conversation) {
          console.warn(`No conversation exists for userId: ${userId} and friendId: ${friendId}`);
          return of(null);
        }

        const updateActiveConversation = (activeConversation: ActiveConversation) =>
          from(
            this.activeConversationRepository.save({
              ...activeConversation,
              socketId,
              conversationId: conversation.id,
            })
          );

        return from(this.activeConversationRepository.findOne({ where: { userId } })).pipe(
          switchMap((activeConversation) =>
            activeConversation
              ? from(this.activeConversationRepository.delete({ userId })).pipe(switchMap(() => updateActiveConversation(activeConversation)))
              : updateActiveConversation({ userId, socketId, conversationId: conversation.id })
          )
        );
      })
    );
  }

  leaveConversation(socketId: string): Observable<DeleteResult> {
    return from(this.activeConversationRepository.delete({ socketId }));
  }

  getActiveUsers(conversationId: number): Observable<ActiveConversation[]> {
    return from(this.activeConversationRepository.find({ where: { conversationId } }));
  }

  createMessage(message: Message): Observable<Message> {
    return from(this.messageRepository.save(message));
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return from(
      this.messageRepository
        .createQueryBuilder('message')
        .innerJoinAndSelect('message.user', 'user')
        .where('message.conversationId = :conversationId', { conversationId })
        .orderBy('message.createdAt', 'ASC')
        .getMany()
    );
  }

  clearData(): Observable<void> {
    const deleteOperations = [
      this.activeConversationRepository.createQueryBuilder().delete().execute(),
      this.messageRepository.createQueryBuilder().delete().execute(),
      this.conversationRepository.createQueryBuilder().delete().execute()
    ];

    return from(Promise.all(deleteOperations))
      .pipe(
        switchMap(() => of(undefined))
      );
  }
}