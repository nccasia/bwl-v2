import { SharedModule } from '@modules/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './controllers';
import { Comment } from './entities';
import { BaseCommentService, CommentService } from './service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), SharedModule],
  controllers: [CommentController],
  providers: [BaseCommentService, CommentService],
  exports: [BaseCommentService, CommentService],
})
export class CommentModule {}
