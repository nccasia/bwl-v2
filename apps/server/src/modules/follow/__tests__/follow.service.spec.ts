import { NotificationService } from '@modules/notification/service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFollowDto } from '../dto';
import { Follow } from '../entities/follow.entity';
import { BaseFollowService } from '../service/base-follow.service';
import { FollowService } from '../service/follow.service';

describe('FollowService', () => {
  let service: FollowService;
  let followRepository: jest.Mocked<Repository<Follow>>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockFollow: Partial<Follow> = {
    id: 'follow-uuid-1',
    followerId: 'user-uuid-1',
    followingId: 'user-uuid-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFollows: Follow[] = [
    mockFollow as Follow,
    { ...mockFollow, id: 'follow-uuid-2', followerId: 'user-uuid-3' } as Follow,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        {
          provide: getRepositoryToken(Follow),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: BaseFollowService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {
            createNotificationAsync: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<FollowService>(FollowService);
    followRepository = module.get(getRepositoryToken(Follow));
    notificationService = module.get(NotificationService);
  });

  describe('followAsync', () => {
    it('should create a new follow relationship when not already following', async () => {
      const dto: CreateFollowDto = { followingId: 'user-uuid-2' };
      followRepository.findOne.mockResolvedValue(null);
      followRepository.create.mockReturnValue(mockFollow as Follow);
      followRepository.save.mockResolvedValue(mockFollow as Follow);

      const result = await service.followAsync('user-uuid-1', dto);

      expect(result).toEqual(mockFollow);
      expect(followRepository.create).toHaveBeenCalledWith({
        followerId: 'user-uuid-1',
        followingId: 'user-uuid-2',
      });
      expect(followRepository.save).toHaveBeenCalled();
      expect(notificationService.createNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'user-uuid-2',
          actorId: 'user-uuid-1',
          type: 'follow',
        }),
      );
    });

    it('should return existing follow (idempotent) and NOT send notification', async () => {
      const dto: CreateFollowDto = { followingId: 'user-uuid-2' };
      followRepository.findOne.mockResolvedValue(mockFollow as Follow);

      const result = await service.followAsync('user-uuid-1', dto);

      expect(result).toEqual(mockFollow);
      expect(followRepository.create).not.toHaveBeenCalled();
      expect(followRepository.save).not.toHaveBeenCalled();
      expect(notificationService.createNotificationAsync).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user tries to follow themselves', async () => {
      const dto: CreateFollowDto = { followingId: 'user-uuid-1' };

      await expect(service.followAsync('user-uuid-1', dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.followAsync('user-uuid-1', dto)).rejects.toMatchObject({
        response: { code: 'SELF_FOLLOW_NOT_ALLOWED' },
      });
      expect(followRepository.findOne).not.toHaveBeenCalled();
      expect(followRepository.create).not.toHaveBeenCalled();
      expect(notificationService.createNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('unfollowAsync', () => {
    it('should delete the follow relationship and return unfollowed: true', async () => {
      followRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.unfollowAsync('user-uuid-1', 'user-uuid-2');

      expect(result).toEqual({ unfollowed: true });
      expect(followRepository.delete).toHaveBeenCalledWith({
        followerId: 'user-uuid-1',
        followingId: 'user-uuid-2',
      });
    });

    it('should still return unfollowed: true even if relationship did not exist', async () => {
      followRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result = await service.unfollowAsync('user-uuid-1', 'user-uuid-99');

      expect(result).toEqual({ unfollowed: true });
    });
  });

  describe('getFollowersAsync', () => {
    it('should return followers list with cursor pagination', async () => {
      followRepository.find.mockResolvedValue(mockFollows);

      const queryOptions = { limit: 10, filters: {} } as any;
      const result = await service.getFollowersAsync('user-uuid-2', queryOptions);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(2);
      expect(followRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ followingId: 'user-uuid-2' }),
        }),
      );
    });

    it('should return empty data when no followers', async () => {
      followRepository.find.mockResolvedValue([]);

      const queryOptions = { limit: 10, filters: {} } as any;
      const result = await service.getFollowersAsync('user-uuid-99', queryOptions);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should respect the limit in cursor pagination', async () => {
      const manyFollows = Array.from({ length: 5 }, (_, i) => ({
        ...mockFollow,
        id: `follow-uuid-${i}`,
        followerId: `user-uuid-${i + 10}`,
      })) as Follow[];
      followRepository.find.mockResolvedValue(manyFollows);

      const queryOptions = { limit: 5, filters: {} } as any;
      const result = await service.getFollowersAsync('user-uuid-2', queryOptions);

      expect(followRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: expect.any(Number) }),
      );
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getFollowingAsync', () => {
    it('should return following list with cursor pagination', async () => {
      followRepository.find.mockResolvedValue(mockFollows);

      const queryOptions = { limit: 10, filters: {} } as any;
      const result = await service.getFollowingAsync('user-uuid-1', queryOptions);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(2);
      expect(followRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ followerId: 'user-uuid-1' }),
        }),
      );
    });

    it('should return empty data when not following anyone', async () => {
      followRepository.find.mockResolvedValue([]);

      const queryOptions = { limit: 10, filters: {} } as any;
      const result = await service.getFollowingAsync('user-uuid-99', queryOptions);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.hasNextPage).toBe(false);
    });
  });

  describe('getFollowerCountAsync', () => {
    it('should return correct follower count', async () => {
      followRepository.count.mockResolvedValue(5);

      const result = await service.getFollowerCountAsync('user-uuid-2');

      expect(result).toBe(5);
      expect(followRepository.count).toHaveBeenCalledWith({
        where: { followingId: 'user-uuid-2' },
      });
    });

    it('should return 0 when no followers', async () => {
      followRepository.count.mockResolvedValue(0);

      const result = await service.getFollowerCountAsync('user-uuid-99');

      expect(result).toBe(0);
    });
  });

  describe('getFollowingCountAsync', () => {
    it('should return correct following count', async () => {
      followRepository.count.mockResolvedValue(3);

      const result = await service.getFollowingCountAsync('user-uuid-1');

      expect(result).toBe(3);
      expect(followRepository.count).toHaveBeenCalledWith({
        where: { followerId: 'user-uuid-1' },
      });
    });

    it('should return 0 when not following anyone', async () => {
      followRepository.count.mockResolvedValue(0);

      const result = await service.getFollowingCountAsync('user-uuid-99');

      expect(result).toBe(0);
    });
  });
});
