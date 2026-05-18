import { QueryOptionsDto } from '@base/dtos/query-options.dto';
import { JwtAuthGuard } from '@base/guards/jwt.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from '../controllers/channel.controller';
import { BaseChannelDto } from '../dto';
import { ChannelType } from '../enums';
import { ChannelService } from '../service';

describe('ChannelController', () => {
  let controller: ChannelController;
  let service: jest.Mocked<ChannelService>;

  const mockChannelDto: Partial<BaseChannelDto> = {
    id: 'channel-uuid-1',
    name: 'general',
    type: ChannelType.Public,
    mezonChannelId: 'mezon-ch-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [
        {
          provide: ChannelService,
          useValue: {
            getChannelsAsync: jest.fn(),
            getChannelByIdAsync: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ChannelController>(ChannelController);
    service = module.get(ChannelService);
  });

  describe('getChannels', () => {
    it('should return paginated channels', async () => {
      const expectedResult = {
        data: [mockChannelDto],
        pagination: { page: 1, pageSize: 10, total: 1 },
      };
      service.getChannelsAsync.mockResolvedValue(expectedResult as never);

      const queryOptions = new QueryOptionsDto();
      queryOptions.page = 1;
      queryOptions.limit = 10;
      queryOptions.sort = {};
      queryOptions.filters = {};

      const result = await controller.getChannels(queryOptions);

      expect(result).toEqual(expectedResult);
      expect(service.getChannelsAsync).toHaveBeenCalledWith(queryOptions);
    });
  });

  describe('getChannelById', () => {
    it('should return channel by ID', async () => {
      const dto = new BaseChannelDto();
      Object.assign(dto, mockChannelDto);
      service.getChannelByIdAsync.mockResolvedValue(dto);

      const result = await controller.getChannelById('channel-uuid-1');

      expect(result).toEqual(dto);
      expect(service.getChannelByIdAsync).toHaveBeenCalledWith('channel-uuid-1');
    });
  });
});
