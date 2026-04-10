import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from '../entities';
import { ReactionTargetType } from '../enums';
import { BaseReactionService } from '../service/base-reaction.service';

describe('BaseReactionService', () => {
  let service: BaseReactionService;
  let reactionRepository: jest.Mocked<Repository<Reaction>>;

  const mockReaction: Partial<Reaction> = {
    id: 'reaction-uuid-1',
    userId: 'user-uuid-1',
    targetId: 'post-uuid-1',
    targetType: ReactionTargetType.Post,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseReactionService,
        {
          provide: getRepositoryToken(Reaction),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BaseReactionService>(BaseReactionService);
    reactionRepository = module.get(getRepositoryToken(Reaction));
  });

  describe('findReactionAsync', () => {
    it('should return reaction when found', async () => {
      reactionRepository.findOne.mockResolvedValue(mockReaction as Reaction);

      const result = await service.findReactionAsync('user-uuid-1', 'post-uuid-1', ReactionTargetType.Post);

      expect(result).toEqual(mockReaction);
      expect(reactionRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1', targetId: 'post-uuid-1', targetType: ReactionTargetType.Post },
      });
    });

    it('should return null when reaction not found', async () => {
      reactionRepository.findOne.mockResolvedValue(null);

      const result = await service.findReactionAsync('user-uuid-1', 'post-uuid-1', ReactionTargetType.Post);

      expect(result).toBeNull();
    });
  });

  describe('getReactionsByTargetAsync', () => {
    it('should return all reactions for a target', async () => {
      reactionRepository.find.mockResolvedValue([mockReaction as Reaction]);

      const result = await service.getReactionsByTargetAsync('post-uuid-1', ReactionTargetType.Post);

      expect(result).toHaveLength(1);
      expect(reactionRepository.find).toHaveBeenCalledWith({
        where: { targetId: 'post-uuid-1', targetType: ReactionTargetType.Post },
      });
    });

    it('should return empty array when no reactions', async () => {
      reactionRepository.find.mockResolvedValue([]);

      const result = await service.getReactionsByTargetAsync('post-uuid-1', ReactionTargetType.Post);

      expect(result).toEqual([]);
    });
  });
});
