import { PickType } from '@nestjs/swagger';
import { Follow } from '../entities/follow.entity';

export class BaseFollowDto extends PickType(Follow, [
    'id',
    'followerId',
    'followingId',
    'createdAt',
]) { }