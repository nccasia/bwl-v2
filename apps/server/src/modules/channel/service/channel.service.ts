import { QueryOptionsHelper } from '@base/decorators/query-options.decorator';
import { QueryOptionsDto } from '@base/dtos/query-options.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { BaseChannelDto } from '../dto';
import { Channel } from '../entities';
import { ChannelType } from '../enums';
import { BaseChannelService } from './base-channel.service';

@Injectable()
export class ChannelService extends BaseChannelService {
  constructor(
    @InjectRepository(Channel)
    channelRepository: Repository<Channel>,
  ) {
    super(channelRepository);
  }

  async getChannelsAsync(queryOptionsDto: QueryOptionsDto) {
    const { getPagination, skip, take } = new QueryOptionsHelper(queryOptionsDto);
    const [rows, count] = await this.channelRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
    const data = rows.map((c) =>
      plainToInstance(BaseChannelDto, c, { excludeExtraneousValues: true }),
    );
    return { data, pagination: getPagination({ count, total: count }) };
  }

  async getChannelByIdAsync(channelId: string): Promise<BaseChannelDto> {
    const channel = await this.findChannelByIdAsync(channelId);
    return plainToInstance(BaseChannelDto, channel, { excludeExtraneousValues: true });
  }

  async upsertFromMezon(
    mezonChannelId: string,
    name: string,
    type: ChannelType = ChannelType.Public,
  ): Promise<Channel> {
    const existing = await this.channelRepository.findOne({ where: { mezonChannelId } });
    if (existing) {
      if (existing.name !== name || existing.type !== type) {
        existing.name = name;
        existing.type = type;
        return this.channelRepository.save(existing);
      }
      return existing;
    }

    const newChannel = this.channelRepository.create({
      mezonChannelId,
      name,
      type,
    });
    return this.channelRepository.save(newChannel);
  }
}
