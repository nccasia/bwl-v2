import { JwtAuthGuard } from '@base/guards/jwt.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { ReactionController } from '../controllers/reaction.controller';
import { BaseReactionDto, LikeReactionDto } from '../dto';
import { ReactionTargetType } from '../enums';
import { ReactionService } from '../service';

describe('ReactionController', () => {
  let controller: ReactionController;
  let service: jest.Mocked<ReactionService>;

  const mockUser = { userId: 'user-uuid-1', role: 'admin' } as any;

  const mockReactionDto: Partial<BaseReactionDto> = {
    id: 'reaction-uuid-1',
    userId: 'user-uuid-1',
    targetId: 'post-uuid-1',
    targetType: ReactionTargetType.Post,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReactionController],
      providers: [
        {
          provide: ReactionService,
          useValue: {
            getLikesAsync: jest.fn(),
            likeAsync: jest.fn(),
            unlikeAsync: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReactionController>(ReactionController);
    service = module.get(ReactionService);
  });

  describe('getByTarget', () => {
    it('should return all likes for a post target', async () => {
      service.getLikesAsync.mockResolvedValue([mockReactionDto as BaseReactionDto]);

      const result = await controller.getByTarget(ReactionTargetType.Post, 'post-uuid-1');

      expect(result).toHaveLength(1);
      expect(service.getLikesAsync).toHaveBeenCalledWith('post-uuid-1', ReactionTargetType.Post);
    });

    it('should return all likes for a comment target', async () => {
      const commentReaction = { ...mockReactionDto, targetType: ReactionTargetType.Comment, targetId: 'comment-uuid-1' };
      service.getLikesAsync.mockResolvedValue([commentReaction as BaseReactionDto]);

      const result = await controller.getByTarget(ReactionTargetType.Comment, 'comment-uuid-1');

      expect(result).toHaveLength(1);
      expect(service.getLikesAsync).toHaveBeenCalledWith('comment-uuid-1', ReactionTargetType.Comment);
    });
  });

  describe('like', () => {
    it('should like a post', async () => {
      const dto = new LikeReactionDto();
      dto.targetId = 'post-uuid-1';
      dto.targetType = ReactionTargetType.Post;

      const reactionDto = new BaseReactionDto();
      Object.assign(reactionDto, mockReactionDto);
      service.likeAsync.mockResolvedValue(reactionDto);

      const result = await controller.like(mockUser, dto);

      expect(result).toEqual(reactionDto);
      expect(service.likeAsync).toHaveBeenCalledWith('user-uuid-1', dto);
    });
  });

  describe('unlike', () => {
    it('should unlike a post', async () => {
      service.unlikeAsync.mockResolvedValue({ unliked: true });

      const result = await controller.unlike(ReactionTargetType.Post, 'post-uuid-1', mockUser);

      expect(result).toEqual({ unliked: true });
      expect(service.unlikeAsync).toHaveBeenCalledWith('user-uuid-1', 'post-uuid-1', ReactionTargetType.Post);
    });

    it('should unlike a comment', async () => {
      service.unlikeAsync.mockResolvedValue({ unliked: true });

      const result = await controller.unlike(ReactionTargetType.Comment, 'comment-uuid-1', mockUser);

      expect(result).toEqual({ unliked: true });
      expect(service.unlikeAsync).toHaveBeenCalledWith('user-uuid-1', 'comment-uuid-1', ReactionTargetType.Comment);
    });
  });
});
