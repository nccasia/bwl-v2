import { PickType } from '@nestjs/swagger';
import { Channel } from '../entities';

export class CreateChannelDto extends PickType(Channel, [
  'name',
  'type',
] as const) { }
