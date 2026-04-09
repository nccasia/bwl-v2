import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities';

@Injectable()
export class BaseCommentService {
  constructor(
    @InjectRepository(Comment)
    protected readonly commentRepository: Repository<Comment>,
  ) {}

  async findCommentByIdAsync(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException({
        message: `Comment with ID ${commentId} not found`,
        code: 'COMMENT_NOT_FOUND',
      });
    }

    return comment;
  }
}
