import { PickType } from '@nestjs/swagger';
import { Comment } from '../entities';

export class CreateCommentDto extends PickType(Comment, [
  'postId',
  'parentId',
  'content',
] as const) {}
