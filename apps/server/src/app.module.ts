import { ConfigAppModule } from '@base/modules/configs/config-app.module';
import { DatabaseModule } from '@base/modules/database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CommonModule } from '@modules/common/common.module';
import { CronjobModule } from '@modules/cronjob/cronjob.module';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';
import { PostModule } from '@modules/post/post.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from './modules/mail/mail.module';
import { QueueModule } from './modules/queue/queue.module';
import { MezonBotModule } from './modules/mezon-bot/mezon-bot.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ChannelModule } from './modules/channel/channel.module';
import { CommentModule } from './modules/comment/comment.module';
import { ReactionModule } from './modules/reaction/reaction.module';
import { FollowModule } from './modules/follow/follow.module';

@Module({
  imports: [
    ConfigAppModule,
    DatabaseModule,
    SharedModule,
    PassportModule,
    CommonModule,
    AuthModule,
    UserModule,
    PostModule,
    MailModule,
    CronjobModule,
    QueueModule,
    MezonBotModule,
    NotificationModule,
    ChannelModule,
    CommentModule,
    ReactionModule,
    FollowModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
