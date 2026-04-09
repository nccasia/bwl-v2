import { PickType } from '@nestjs/swagger';
import { Reaction } from '../entities';

export class LikeReactionDto extends PickType(Reaction, [
  'targetId',
  'targetType',
] as const) {}
