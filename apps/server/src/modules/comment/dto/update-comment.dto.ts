import { PickType } from '@nestjs/swagger';
import { Comment } from '../entities';

export class UpdateCommentDto extends PickType(Comment, ['content'] as const) {}
