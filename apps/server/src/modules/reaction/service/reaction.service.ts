import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { BaseReactionDto, LikeReactionDto } from '../dto';
import { Reaction } from '../entities';
import { ReactionTargetType } from '../enums';
import { BaseReactionService } from './base-reaction.service';

@Injectable()
export class ReactionService extends BaseReactionService {
  constructor(
    @InjectRepository(Reaction)
    reactionRepository: Repository<Reaction>,
  ) {
    super(reactionRepository);
  }

  //Get all likes for a target (post or comment).
  async getLikesAsync(
    targetId: string,
    targetType: ReactionTargetType,
  ): Promise<BaseReactionDto[]> {
    const reactions = await this.getReactionsByTargetAsync(targetId, targetType);
    return reactions.map((r) =>
      plainToInstance(BaseReactionDto, r, { excludeExtraneousValues: true }),
    );
  }

  //Like a target
  async likeAsync(
    userId: string,
    dto: LikeReactionDto,
  ): Promise<BaseReactionDto> {
    const { targetId, targetType } = dto;

    const existing = await this.findReactionAsync(userId, targetId, targetType);
    if (existing) {
      return plainToInstance(BaseReactionDto, existing, { excludeExtraneousValues: true });
    }

    const reaction = this.reactionRepository.create({ userId, targetId, targetType });
    const saved = await this.reactionRepository.save(reaction);
    return plainToInstance(BaseReactionDto, saved, { excludeExtraneousValues: true });
  }

  //Unlike a target
  async unlikeAsync(
    userId: string,
    targetId: string,
    targetType: ReactionTargetType,
  ): Promise<{ unliked: true }> {
    await this.reactionRepository.delete({ userId, targetId, targetType });
    return { unliked: true };
  }
}
