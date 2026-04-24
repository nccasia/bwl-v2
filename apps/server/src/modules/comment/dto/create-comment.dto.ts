import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Comment } from '../entities';

export class CreateCommentDto extends PickType(Comment, [
  'postId',
  'parentId',
  'content',
] as const) {
  /**
   * ID of the user being directly replied to.
   * Used for reply notifications in flat-threaded comment systems
   * where parentId always points to the top-level comment.
   */
  @ApiPropertyOptional({ description: 'User ID of the person being replied to (for flat-thread reply notifications)' })
  @IsOptional()
  @IsString()
  replyToUserId?: string;
}
