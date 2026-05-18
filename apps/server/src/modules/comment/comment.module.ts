import { NotificationModule } from '@modules/notification/notification.module';
import { Post } from '@modules/post/entities';
import { SharedModule } from '@modules/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './controllers';
import { Comment } from './entities';
import { BaseCommentService, CommentService } from './service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    SharedModule,
    NotificationModule,
  ],
  controllers: [CommentController],
  providers: [BaseCommentService, CommentService],
  exports: [BaseCommentService, CommentService],
})
export class CommentModule {}
