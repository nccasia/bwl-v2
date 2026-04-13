import { CursorQueryOptionsHelper } from '@base/decorators/query-options.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { NotificationService } from '@modules/notification/service';
import { NotificationType } from '@modules/notification/enums';
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

    // Trigger notifications (fire-and-forget)
    this.triggerCommentNotifications(saved).catch(() => {});

    return plainToInstance(BaseCommentDto, saved, { excludeExtraneousValues: true });
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

  private async triggerCommentNotifications(comment: Comment): Promise<void> {
    // Notify post author
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

    // Notify parent comment author (for replies)
    if (comment.parentId) {
      const parentComment = await this.commentRepository.findOne({ where: { id: comment.parentId } });
      if (parentComment && parentComment.authorId !== comment.authorId) {
        await this.notificationService.createNotificationAsync({
          recipientId: parentComment.authorId,
          actorId: comment.authorId,
          type: NotificationType.Comment,
          body: comment.content.substring(0, 100),
          entityId: comment.postId,
          entityType: 'post',
        });
      }
    }
  }
}
