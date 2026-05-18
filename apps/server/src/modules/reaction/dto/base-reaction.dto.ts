import { PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Reaction } from '../entities';
import { ReactionTargetType } from '../enums';

export class BaseReactionDto extends PickType(Reaction, [
  'id',
  'userId',
  'targetId',
  'targetType',
  'createdAt',
  'updatedAt',
] as const) {
  @Expose() id: string;
  @Expose() userId: string;
  @Expose() targetId: string;
  @Expose() targetType: ReactionTargetType;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
