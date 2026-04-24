import { NotificationService } from '@modules/notification/service';
import { NotificationType } from '@modules/notification/enums';
import { NotificationGateway } from '@modules/notification/gateway';
import { RealtimeEvent } from '@base/enums/websocket-event.enum';
import { Post } from '@modules/post/entities';
import { Comment } from '@modules/comment/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { BaseReactionDto, LikeReactionDto } from '../dto';
import { Reaction } from '../entities';
import { ReactionTargetType } from '../enums';
import { BaseReactionService } from './base-reaction.service';

@Injectable()
export class ReactionService extends BaseReactionService {
  constructor(
    @InjectRepository(Reaction)
    reactionRepository: Repository<Reaction>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {
    super(reactionRepository);
  }

  //Get all likes for a target (post or comment).
  async getLikesAsync(
    targetId: string,
    targetType: ReactionTargetType,
  ): Promise<BaseReactionDto[]> {
    const reactions = await this.getReactionsByTargetAsync(targetId, targetType);
    return reactions.map((r) =>
      plainToInstance(BaseReactionDto, r, { excludeExtraneousValues: true }),
    );
  }

  //Like a target
  async likeAsync(
    userId: string,
    dto: LikeReactionDto,
  ): Promise<BaseReactionDto> {
    const { targetId, targetType } = dto;

    const existing = await this.findReactionAsync(userId, targetId, targetType);
    if (existing) {
      return plainToInstance(BaseReactionDto, existing, { excludeExtraneousValues: true });
    }

    const reaction = this.reactionRepository.create({ userId, targetId, targetType });
    const saved = await this.reactionRepository.save(reaction);

    // Awaited to prevent race condition with rapid like→unlike→like
    await this.triggerLikeNotification(userId, targetId, targetType);

    // Broadcast realtime reaction update
    const reactions = await this.getReactionsByTargetAsync(targetId, targetType);
    const reactionDtos = reactions.map((r) => plainToInstance(BaseReactionDto, r, { excludeExtraneousValues: true }));

    if (targetType === ReactionTargetType.Post) {
      this.notificationGateway.broadcast(RealtimeEvent.POST_REACTION_UPDATED, {
        postId: targetId,
        reactions: reactionDtos,
      });
    } else if (targetType === ReactionTargetType.Comment) {
      this.notificationGateway.broadcast(RealtimeEvent.COMMENT_REACTION_UPDATED, {
        commentId: targetId,
        reactions: reactionDtos,
      });
    }

    return plainToInstance(BaseReactionDto, saved, { excludeExtraneousValues: true });
  }

  //Unlike a target
  async unlikeAsync(
    userId: string,
    targetId: string,
    targetType: ReactionTargetType,
  ): Promise<{ unliked: true }> {
    await this.reactionRepository.delete({ userId, targetId, targetType });

    // Awaited to prevent race condition with rapid like→unlike→like
    await this.removeLikeNotification(userId, targetId, targetType);

    // Broadcast realtime reaction update
    const reactions = await this.getReactionsByTargetAsync(targetId, targetType);
    const reactionDtos = reactions.map((r) => plainToInstance(BaseReactionDto, r, { excludeExtraneousValues: true }));

    if (targetType === ReactionTargetType.Post) {
      this.notificationGateway.broadcast(RealtimeEvent.POST_REACTION_UPDATED, {
        postId: targetId,
        reactions: reactionDtos,
      });
    } else if (targetType === ReactionTargetType.Comment) {
      this.notificationGateway.broadcast(RealtimeEvent.COMMENT_REACTION_UPDATED, {
        commentId: targetId,
        reactions: reactionDtos,
      });
    }

    return { unliked: true };
  }

  private async removeLikeNotification(
    actorId: string,
    targetId: string,
    targetType: ReactionTargetType,
  ): Promise<void> {
    let entityId: string | undefined;

    if (targetType === ReactionTargetType.Post) {
      entityId = targetId;
    } else if (targetType === ReactionTargetType.Comment) {
      const comment = await this.commentRepository.findOne({ where: { id: targetId } });
      if (comment) entityId = comment.postId;
    }

    if (entityId) {
      await this.notificationService.removeNotificationAsync({
        actorId,
        entityId,
        type: NotificationType.Reaction,
      });
    }
  }

  private async triggerLikeNotification(
    actorId: string,
    targetId: string,
    targetType: ReactionTargetType,
  ): Promise<void> {
    let recipientId: string | undefined;
    let entityId: string;
    let entityType: string;

    if (targetType === ReactionTargetType.Post) {
      const post = await this.postRepository.findOne({ where: { id: targetId } });
      if (post) {
        recipientId = post.authorId;
        entityId = post.id;
        entityType = 'post';
      }
    } else if (targetType === ReactionTargetType.Comment) {
      const comment = await this.commentRepository.findOne({ where: { id: targetId } });
      if (comment) {
        recipientId = comment.authorId;
        entityId = comment.postId;
        entityType = 'post';
      }
    }

    if (recipientId) {
      await this.notificationService.createNotificationAsync({
        recipientId,
        actorId,
        type: NotificationType.Reaction,
        entityId,
        entityType,
      });
    }
  }
}
