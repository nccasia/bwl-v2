import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from '../entities';
import { ReactionTargetType } from '../enums';

@Injectable()
export class BaseReactionService {
  constructor(
    @InjectRepository(Reaction)
    protected readonly reactionRepository: Repository<Reaction>,
  ) {}

  async findReactionAsync(
    userId: string,
    targetId: string,
    targetType: ReactionTargetType,
  ): Promise<Reaction | null> {
    return this.reactionRepository.findOne({
      where: { userId, targetId, targetType },
    });
  }

  async getReactionsByTargetAsync(
    targetId: string,
    targetType: ReactionTargetType,
  ): Promise<Reaction[]> {
    return this.reactionRepository.find({ where: { targetId, targetType } });
  }
}
