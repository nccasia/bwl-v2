import { PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Channel } from '../entities';
import { ChannelType } from '../enums';

export class BaseChannelDto extends PickType(Channel, [
  'id',
  'name',
  'type',
  'mezonChannelId',
  'createdAt',
  'updatedAt',
] as const) {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() type: ChannelType;
  @Expose() mezonChannelId?: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
