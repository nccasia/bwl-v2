import { QueryOptionsDto } from '@base/dtos/query-options.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities';
import { ChannelType } from '../enums';
import { ChannelService } from '../service/channel.service';

describe('ChannelService', () => {
  let service: ChannelService;
  let channelRepository: jest.Mocked<Repository<Channel>>;

  const mockChannel: Channel = {
    id: 'channel-uuid-1',
    name: 'general',
    type: ChannelType.Public,
    mezonChannelId: 'mezon-ch-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as Channel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: getRepositoryToken(Channel),
          useValue: {
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
    channelRepository = module.get(getRepositoryToken(Channel));
  });

  describe('getChannelsAsync', () => {
    it('should return paginated channels', async () => {
      channelRepository.findAndCount.mockResolvedValue([[mockChannel], 1]);

      const queryOptions = new QueryOptionsDto();
      queryOptions.page = 1;
      queryOptions.limit = 10;
      queryOptions.sort = {};
      queryOptions.filters = {};

      const result = await service.getChannelsAsync(queryOptions);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(1);
      expect(channelRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { createdAt: 'DESC' } }),
      );
    });
  });

  describe('getChannelByIdAsync', () => {
    it('should return a channel by ID', async () => {
      channelRepository.findOne.mockResolvedValue(mockChannel);

      const result = await service.getChannelByIdAsync('channel-uuid-1');

      expect(result).toHaveProperty('id', 'channel-uuid-1');
      expect(channelRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'channel-uuid-1' },
      });
    });

    it('should throw NotFoundException when channel not found', async () => {
      channelRepository.findOne.mockResolvedValue(null);

      await expect(service.getChannelByIdAsync('nonexistent-id')).rejects.toThrow();
    });
  });

  describe('upsertFromMezon', () => {
    it('should return existing channel if name and type unchanged', async () => {
      channelRepository.findOne.mockResolvedValue(mockChannel);

      const result = await service.upsertFromMezon('mezon-ch-1', 'general', ChannelType.Public);

      expect(result).toEqual(mockChannel);
      expect(channelRepository.save).not.toHaveBeenCalled();
    });

    it('should update channel if name changed', async () => {
      const outdated = { ...mockChannel, name: 'old-name' } as Channel;
      channelRepository.findOne.mockResolvedValue(outdated);
      channelRepository.save.mockResolvedValue({ ...outdated, name: 'general' } as Channel);

      await service.upsertFromMezon('mezon-ch-1', 'general', ChannelType.Public);

      expect(channelRepository.save).toHaveBeenCalled();
    });

    it('should create new channel when not found', async () => {
      channelRepository.findOne.mockResolvedValue(null);
      channelRepository.create.mockReturnValue(mockChannel);
      channelRepository.save.mockResolvedValue(mockChannel);

      const result = await service.upsertFromMezon('mezon-ch-new', 'new-channel', ChannelType.Public);

      expect(result).toHaveProperty('id');
      expect(channelRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ mezonChannelId: 'mezon-ch-new', name: 'new-channel' }),
      );
      expect(channelRepository.save).toHaveBeenCalled();
    });
  });
});
