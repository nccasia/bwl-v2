import { CursorQueryOptionsHelper } from '@base/decorators/query-options.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
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
}
