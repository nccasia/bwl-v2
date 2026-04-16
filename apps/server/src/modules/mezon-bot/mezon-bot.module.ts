import { AuthModule } from '@modules/auth/auth.module';
import { ChannelModule } from '@modules/channel/channel.module';
import { Post } from '@modules/post/entities';
import { PostModule } from '@modules/post/post.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MezonBotService } from './mezon-bot.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    PostModule,
    AuthModule,
    ChannelModule,
    UserModule,
  ],
  providers: [MezonBotService],
  exports: [MezonBotService],
})
export class MezonBotModule { }
