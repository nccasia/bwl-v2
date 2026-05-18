import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';
import { BaseFollowService } from '../service/base-follow.service';

describe('BaseFollowService', () => {
  let service: BaseFollowService;
  let followRepository: jest.Mocked<Repository<Follow>>;

  const mockFollow: Partial<Follow> = {
    id: 'follow-uuid-1',
    followerId: 'user-uuid-1',
    followingId: 'user-uuid-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseFollowService,
        {
          provide: getRepositoryToken(Follow),
          useValue: {
            findOne: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BaseFollowService>(BaseFollowService);
    followRepository = module.get(getRepositoryToken(Follow));
  });

  describe('findFollowByIdAsync', () => {
    it('should return follow when found', async () => {
      followRepository.findOne.mockResolvedValue(mockFollow as Follow);

      const result = await service.findFollowByIdAsync('follow-uuid-1');

      expect(result).toEqual(mockFollow);
      expect(followRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'follow-uuid-1' },
      });
    });

    it('should throw NotFoundException when follow not found', async () => {
      followRepository.findOne.mockResolvedValue(null);

      await expect(service.findFollowByIdAsync('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findFollowByIdAsync('non-existent-id')).rejects.toMatchObject({
        response: { code: 'FOLLOW_NOT_FOUND' },
      });
    });
  });

  describe('isFollowingAsync', () => {
    it('should return true when follow relationship exists', async () => {
      followRepository.exists.mockResolvedValue(true);

      const result = await service.isFollowingAsync('user-uuid-1', 'user-uuid-2');

      expect(result).toBe(true);
      expect(followRepository.exists).toHaveBeenCalledWith({
        where: { followerId: 'user-uuid-1', followingId: 'user-uuid-2' },
      });
    });

    it('should return false when follow relationship does not exist', async () => {
      followRepository.exists.mockResolvedValue(false);

      const result = await service.isFollowingAsync('user-uuid-1', 'user-uuid-3');

      expect(result).toBe(false);
    });
  });

  describe('findFollowAsync', () => {
    it('should return follow when relationship exists', async () => {
      followRepository.findOne.mockResolvedValue(mockFollow as Follow);

      const result = await service.findFollowAsync('user-uuid-1', 'user-uuid-2');

      expect(result).toEqual(mockFollow);
      expect(followRepository.findOne).toHaveBeenCalledWith({
        where: { followerId: 'user-uuid-1', followingId: 'user-uuid-2' },
      });
    });

    it('should return null when relationship does not exist', async () => {
      followRepository.findOne.mockResolvedValue(null);

      const result = await service.findFollowAsync('user-uuid-1', 'user-uuid-99');

      expect(result).toBeNull();
    });
  });
});
