import { CursorQueryOptionsHelper } from '@base/decorators/query-options.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { NotificationService } from '@modules/notification/service';
import { NotificationType } from '@modules/notification/enums';
import { NotificationGateway } from '@modules/notification/gateway';
import { RealtimeEvent } from '@base/enums/websocket-event.enum';
import { Post } from '@modules/post/entities';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { IsNull, Repository } from 'typeorm';
import { BaseCommentDto, CreateCommentDto, UpdateCommentDto } from '../dto';
import { Comment } from '../entities';
import { BaseCommentService } from './base-comment.service';

@Injectable()
export class CommentService extends BaseCommentService {
  constructor(
    @InjectRepository(Comment)
    commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {
    super(commentRepository);
  }

  /**
   * Get all top-level comments for a post (cursor pagination).
   */
  async getCommentsByPostAsync(postId: string, queryOptionsDto: CursorQueryOptionsDto) {
    const cursorHelper = new CursorQueryOptionsHelper(queryOptionsDto, {
      cursorField: 'id',
      direction: 'ASC',
    });

    const rawComments = await this.commentRepository.find({
      take: cursorHelper.getCursorLimit(),
      where: { postId, parentId: IsNull(), ...cursorHelper.buildWhereConditions() },
      order: cursorHelper.getCursorOrder(),
    });

    const { items, pagination } = cursorHelper.getCursorPagination(rawComments);
    const data = items.map((c) =>
      plainToInstance(BaseCommentDto, c, { excludeExtraneousValues: true }),
    );

    return { data, pagination };
  }

  /**
   * Get all replies for a specific comment (cursor pagination).
   */
  async getRepliesByCommentAsync(parentId: string, queryOptionsDto: CursorQueryOptionsDto) {
    const cursorHelper = new CursorQueryOptionsHelper(queryOptionsDto, {
      cursorField: 'id',
      direction: 'ASC',
    });

    const rawReplies = await this.commentRepository.find({
      take: cursorHelper.getCursorLimit(),
      where: { parentId, ...cursorHelper.buildWhereConditions() },
      order: cursorHelper.getCursorOrder(),
    });

    const { items, pagination } = cursorHelper.getCursorPagination(rawReplies);
    const data = items.map((c) =>
      plainToInstance(BaseCommentDto, c, { excludeExtraneousValues: true }),
    );

    return { data, pagination };
  }

  async createCommentAsync(authorId: string, dto: CreateCommentDto): Promise<BaseCommentDto> {
    const comment = this.commentRepository.create({ ...dto, authorId });
    const saved = await this.commentRepository.save(comment);

    // Increment denormalized comment counter on the post
    await this.postRepository.increment({ id: dto.postId }, 'commentCount', 1);

    // Broadcast realtime comment count update to all connected users
    const updatedPost = await this.postRepository.findOne({ where: { id: dto.postId }, select: ['id', 'commentCount', 'authorId'] });
    if (updatedPost) {
      this.notificationGateway.broadcast(RealtimeEvent.POST_COMMENT_UPDATED, {
        postId: dto.postId,
        commentCount: updatedPost.commentCount,
      });
    }

    // Broadcast new comment so other clients update the comment list in realtime
    const commentDto = plainToInstance(BaseCommentDto, saved, { excludeExtraneousValues: true });
    this.notificationGateway.broadcast(RealtimeEvent.POST_COMMENT_CREATED, {
      postId: dto.postId,
      parentId: dto.parentId ?? null,
      comment: commentDto,
    });

    // Trigger notifications (fire-and-forget)
    this.triggerCommentNotifications(saved, dto.replyToUserId).catch(() => { });

    return commentDto;
  }

  async updateCommentAsync(
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<BaseCommentDto> {
    const comment = await this.assertAuthorAsync(commentId, userId);
    const updated = await this.commentRepository.save({
      ...comment,
      content: dto.content,
      isEdited: true,
    });
    return plainToInstance(BaseCommentDto, updated, { excludeExtraneousValues: true });
  }

  async deleteCommentAsync(commentId: string, userId: string): Promise<{ commentId: string }> {
    const comment = await this.assertAuthorAsync(commentId, userId);
    await this.commentRepository.softRemove(comment);

    // Decrement denormalized comment counter on the post (floor at 0)
    await this.postRepository
      .createQueryBuilder()
      .update()
      .set({ commentCount: () => 'GREATEST(comment_count - 1, 0)' })
      .where('id = :postId', { postId: comment.postId })
      .execute();

    // Broadcast realtime comment count update to all connected users
    const updatedPost = await this.postRepository.findOne({ where: { id: comment.postId }, select: ['id', 'commentCount'] });
    if (updatedPost) {
      this.notificationGateway.broadcast(RealtimeEvent.POST_COMMENT_UPDATED, {
        postId: comment.postId,
        commentCount: updatedPost.commentCount,
      });
    }

    return { commentId: comment.id };
  }

  private async assertAuthorAsync(commentId: string, userId: string): Promise<Comment> {
    const comment = await this.findCommentByIdAsync(commentId);
    if (comment.authorId !== userId) {
      throw new ForbiddenException({
        message: 'You are not the author of this comment',
        code: 'COMMENT_FORBIDDEN',
      });
    }
    return comment;
  }

  private async triggerCommentNotifications(comment: Comment, replyToUserId?: string): Promise<void> {
    const isReply = !!comment.parentId;

    // Top-level comment → notify post author
    if (!isReply) {
      const post = await this.postRepository.findOne({ where: { id: comment.postId } });
      if (post && post.authorId !== comment.authorId) {
        await this.notificationService.createNotificationAsync({
          recipientId: post.authorId,
          actorId: comment.authorId,
          type: NotificationType.Comment,
          body: comment.content.substring(0, 100),
          entityId: comment.postId,
          entityType: 'post',
        });
      }
      return;
    }

    // Reply → notify the exact person being replied to (passed from frontend)
    if (replyToUserId && replyToUserId !== comment.authorId) {
      await this.notificationService.createNotificationAsync({
        recipientId: replyToUserId,
        actorId: comment.authorId,
        type: NotificationType.Reply,
        body: comment.content.substring(0, 100),
        entityId: comment.parentId,
        entityType: 'comment',
      });
    } else {
      // Fallback: notify parent comment author
      const parentComment = await this.commentRepository.findOne({ where: { id: comment.parentId } });
      if (parentComment && parentComment.authorId !== comment.authorId) {
        await this.notificationService.createNotificationAsync({
          recipientId: parentComment.authorId,
          actorId: comment.authorId,
          type: NotificationType.Reply,
          body: comment.content.substring(0, 100),
          entityId: comment.parentId,
          entityType: 'comment',
        });
      }
    }
  }
}
