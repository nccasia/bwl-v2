import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities';
import { ChannelType } from '../enums';
import { BaseChannelService } from '../service/base-channel.service';

describe('BaseChannelService', () => {
  let service: BaseChannelService;
  let channelRepository: jest.Mocked<Repository<Channel>>;

  const mockChannel: Partial<Channel> = {
    id: 'channel-uuid-1',
    name: 'general',
    type: ChannelType.Public,
    mezonChannelId: 'mezon-ch-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseChannelService,
        {
          provide: getRepositoryToken(Channel),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BaseChannelService>(BaseChannelService);
    channelRepository = module.get(getRepositoryToken(Channel));
  });

  describe('findChannelByIdAsync', () => {
    it('should return channel when found', async () => {
      channelRepository.findOne.mockResolvedValue(mockChannel as Channel);

      const result = await service.findChannelByIdAsync('channel-uuid-1');

      expect(result).toEqual(mockChannel);
      expect(channelRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'channel-uuid-1' },
      });
    });

    it('should throw NotFoundException when channel not found', async () => {
      channelRepository.findOne.mockResolvedValue(null);

      await expect(service.findChannelByIdAsync('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
