import { SharedModule } from '@modules/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelController } from './controllers';
import { Channel } from './entities';
import { BaseChannelService, ChannelService } from './service';

@Module({
  imports: [TypeOrmModule.forFeature([Channel]), SharedModule],
  controllers: [ChannelController],
  providers: [BaseChannelService, ChannelService],
  exports: [BaseChannelService, ChannelService],
})
export class ChannelModule {}
