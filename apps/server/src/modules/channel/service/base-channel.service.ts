import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from '../entities';

@Injectable()
export class BaseChannelService {
  constructor(
    @InjectRepository(Channel)
    protected readonly channelRepository: Repository<Channel>,
  ) {}

  async findChannelByIdAsync(channelId: string): Promise<Channel> {
    const channel = await this.channelRepository.findOne({
      where: { id: channelId },
    });

    if (!channel) {
      throw new NotFoundException({
        message: `Channel with ID ${channelId} not found`,
        code: 'CHANNEL_NOT_FOUND',
      });
    }

    return channel;
  }

}
