import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '@modules/notification/service';
import { Post } from '@modules/post/entities';
import { Comment } from '@modules/comment/entities';
import { LikeReactionDto } from '../dto';
import { Reaction } from '../entities';
import { ReactionTargetType } from '../enums';
import { ReactionService } from '../service/reaction.service';

describe('ReactionService', () => {
  let service: ReactionService;
  let reactionRepository: jest.Mocked<Repository<Reaction>>;

  const mockReaction: Reaction = {
    id: 'reaction-uuid-1',
    userId: 'user-uuid-1',
    targetId: 'post-uuid-1',
    targetType: ReactionTargetType.Post,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    generateId: jest.fn(),
  } as unknown as Reaction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionService,
        {
          provide: getRepositoryToken(Reaction),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Post),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createNotificationAsync: jest.fn(),
            removeNotificationAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReactionService>(ReactionService);
    reactionRepository = module.get(getRepositoryToken(Reaction));
  });

  describe('getLikesAsync', () => {
    it('should return all likes for a target', async () => {
      reactionRepository.find.mockResolvedValue([mockReaction]);

      const result = await service.getLikesAsync('post-uuid-1', ReactionTargetType.Post);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('userId', 'user-uuid-1');
      expect(reactionRepository.find).toHaveBeenCalledWith({
        where: { targetId: 'post-uuid-1', targetType: ReactionTargetType.Post },
      });
    });

    it('should return empty array when no likes', async () => {
      reactionRepository.find.mockResolvedValue([]);

      const result = await service.getLikesAsync('post-uuid-1', ReactionTargetType.Post);

      expect(result).toHaveLength(0);
    });
  });

  describe('likeAsync', () => {
    it('should create a new like when none exists', async () => {
      reactionRepository.findOne.mockResolvedValue(null);
      reactionRepository.create.mockReturnValue(mockReaction);
      reactionRepository.save.mockResolvedValue(mockReaction);

      const dto = new LikeReactionDto();
      dto.targetId = 'post-uuid-1';
      dto.targetType = ReactionTargetType.Post;

      const result = await service.likeAsync('user-uuid-1', dto);

      expect(result).toHaveProperty('id');
      expect(reactionRepository.create).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        targetId: 'post-uuid-1',
        targetType: ReactionTargetType.Post,
      });
      expect(reactionRepository.save).toHaveBeenCalled();
    });

    it('should return existing like without duplicating', async () => {
      reactionRepository.findOne.mockResolvedValue(mockReaction);

      const dto = new LikeReactionDto();
      dto.targetId = 'post-uuid-1';
      dto.targetType = ReactionTargetType.Post;

      const result = await service.likeAsync('user-uuid-1', dto);

      expect(result).toHaveProperty('id', 'reaction-uuid-1');
      expect(reactionRepository.create).not.toHaveBeenCalled();
      expect(reactionRepository.save).not.toHaveBeenCalled();
    });

    it('should work for comment target type', async () => {
      const commentReaction = { ...mockReaction, targetType: ReactionTargetType.Comment, targetId: 'comment-uuid-1' } as Reaction;
      reactionRepository.findOne.mockResolvedValue(null);
      reactionRepository.create.mockReturnValue(commentReaction);
      reactionRepository.save.mockResolvedValue(commentReaction);

      const dto = new LikeReactionDto();
      dto.targetId = 'comment-uuid-1';
      dto.targetType = ReactionTargetType.Comment;

      const result = await service.likeAsync('user-uuid-1', dto);

      expect(result).toHaveProperty('targetType', ReactionTargetType.Comment);
    });
  });

  describe('unlikeAsync', () => {
    it('should delete reaction and return unliked:true', async () => {
      reactionRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.unlikeAsync('user-uuid-1', 'post-uuid-1', ReactionTargetType.Post);

      expect(result).toEqual({ unliked: true });
      expect(reactionRepository.delete).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        targetId: 'post-uuid-1',
        targetType: ReactionTargetType.Post,
      });
    });

    it('should return unliked:true even when reaction did not exist (idempotent)', async () => {
      reactionRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result = await service.unlikeAsync('user-uuid-1', 'post-uuid-1', ReactionTargetType.Post);

      expect(result).toEqual({ unliked: true });
      expect(reactionRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
