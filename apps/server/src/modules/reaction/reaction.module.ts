import { Comment } from '@modules/comment/entities';
import { NotificationModule } from '@modules/notification/notification.module';
import { Post } from '@modules/post/entities';
import { SharedModule } from '@modules/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionController } from './controllers';
import { Reaction } from './entities';
import { BaseReactionService, ReactionService } from './service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reaction, Post, Comment]),
    SharedModule,
    NotificationModule,
  ],
  controllers: [ReactionController],
  providers: [BaseReactionService, ReactionService],
  exports: [BaseReactionService, ReactionService],
})
export class ReactionModule {}
