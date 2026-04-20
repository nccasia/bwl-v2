import { JwtAuthGuard } from '@base/guards/jwt.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateFollowDto } from '../dto';
import { Follow } from '../entities/follow.entity';
import { FollowController } from '../controllers/follow.controller';
import { FollowService } from '../service/follow.service';

describe('FollowController', () => {
  let controller: FollowController;
  let service: jest.Mocked<FollowService>;

  const mockUser = { userId: 'user-uuid-1', role: 'USER' };

  const mockFollow: Partial<Follow> = {
    id: 'follow-uuid-1',
    followerId: 'user-uuid-1',
    followingId: 'user-uuid-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCursorPagination = {
    data: [mockFollow],
    pagination: { hasNextPage: false, nextCursor: undefined },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [
        {
          provide: FollowService,
          useValue: {
            followAsync: jest.fn(),
            unfollowAsync: jest.fn(),
            getFollowersAsync: jest.fn(),
            getFollowingAsync: jest.fn(),
            isFollowingAsync: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FollowController>(FollowController);
    service = module.get(FollowService);
  });

  describe('follow', () => {
    it('should call followAsync with userId from token and return follow entity', async () => {
      const dto: CreateFollowDto = { followingId: 'user-uuid-2' };
      service.followAsync.mockResolvedValue(mockFollow as Follow);

      const result = await controller.follow(mockUser as any, dto);

      expect(result).toEqual(mockFollow);
      expect(service.followAsync).toHaveBeenCalledWith('user-uuid-1', dto);
    });

    it('should return existing follow (idempotent) when already following', async () => {
      const dto: CreateFollowDto = { followingId: 'user-uuid-2' };
      service.followAsync.mockResolvedValue(mockFollow as Follow);

      const result = await controller.follow(mockUser as any, dto);

      expect(result).toEqual(mockFollow);
    });
  });

  describe('unfollow', () => {
    it('should call unfollowAsync with userId from token and followingId from param', async () => {
      service.unfollowAsync.mockResolvedValue({ unfollowed: true });

      const result = await controller.unfollow(mockUser as any, 'user-uuid-2');

      expect(result).toEqual({ unfollowed: true });
      expect(service.unfollowAsync).toHaveBeenCalledWith('user-uuid-1', 'user-uuid-2');
    });
  });

  describe('getFollowers', () => {
    it('should return followers with pagination', async () => {
      service.getFollowersAsync.mockResolvedValue(mockCursorPagination as any);
      const query = { limit: 10, filters: {} } as any;

      const result = await controller.getFollowers('user-uuid-2', query);

      expect(result).toEqual(mockCursorPagination);
      expect(service.getFollowersAsync).toHaveBeenCalledWith('user-uuid-2', query);
    });

    it('should return empty list when user has no followers', async () => {
      service.getFollowersAsync.mockResolvedValue({
        data: [],
        pagination: { hasNextPage: false, nextCursor: undefined },
      } as any);
      const query = { limit: 10, filters: {} } as any;

      const result = await controller.getFollowers('user-uuid-99', query);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.hasNextPage).toBe(false);
    });
  });

  describe('getFollowing', () => {
    it('should return following list with pagination', async () => {
      service.getFollowingAsync.mockResolvedValue(mockCursorPagination as any);
      const query = { limit: 10, filters: {} } as any;

      const result = await controller.getFollowing('user-uuid-1', query);

      expect(result).toEqual(mockCursorPagination);
      expect(service.getFollowingAsync).toHaveBeenCalledWith('user-uuid-1', query);
    });

    it('should return empty list when user is not following anyone', async () => {
      service.getFollowingAsync.mockResolvedValue({
        data: [],
        pagination: { hasNextPage: false, nextCursor: undefined },
      } as any);
      const query = { limit: 10, filters: {} } as any;

      const result = await controller.getFollowing('user-uuid-99', query);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('isFollowing', () => {
    it('should return { isFollowing: true } when user is following', async () => {
      service.isFollowingAsync.mockResolvedValue(true);

      const result = await controller.isFollowing(mockUser as any, 'user-uuid-2');

      expect(result).toEqual({ isFollowing: true });
      expect(service.isFollowingAsync).toHaveBeenCalledWith('user-uuid-1', 'user-uuid-2');
    });

    it('should return { isFollowing: false } when user is not following', async () => {
      service.isFollowingAsync.mockResolvedValue(false);

      const result = await controller.isFollowing(mockUser as any, 'user-uuid-99');

      expect(result).toEqual({ isFollowing: false });
      expect(service.isFollowingAsync).toHaveBeenCalledWith('user-uuid-1', 'user-uuid-99');
    });
  });
});
