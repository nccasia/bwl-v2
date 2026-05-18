import { PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Comment } from '../entities';

export class BaseCommentDto extends PickType(Comment, [
  'id',
  'postId',
  'authorId',
  'parentId',
  'content',
  'isEdited',
  'createdAt',
  'updatedAt',
] as const) {
  @Expose() id: string;
  @Expose() postId: string;
  @Expose() authorId: string;
  @Expose() parentId?: string;
  @Expose() content: string;
  @Expose() isEdited: boolean;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
