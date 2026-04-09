import { ApiQueryOptions } from '@base/decorators/api-query-options.decorator';
import { QueryOptions } from '@base/decorators/query-options.decorator';
import { ApiResponseType } from '@base/decorators/response-swagger.decorator';
import { QueryOptionsDto } from '@base/dtos/query-options.dto';
import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseChannelDto } from '../dto';
import { ChannelService } from '../service';

@ApiTags('Channels')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) { }

  @ApiOperation({ summary: 'Get all channels with pagination' })
  @ApiQueryOptions()
  @ApiResponseType(BaseChannelDto, { isArray: true, hasPagination: true })
  @Get('get-channels')
  async getChannels(@QueryOptions() queryOptions: QueryOptionsDto) {
    return this.channelService.getChannelsAsync(queryOptions);
  }

  @ApiOperation({ summary: 'Get a channel by ID' })
  @ApiResponseType(BaseChannelDto)
  @Get('get-channel/:channelId')
  async getChannelById(@Param('channelId') channelId: string) {
    return this.channelService.getChannelByIdAsync(channelId);
  }

}
