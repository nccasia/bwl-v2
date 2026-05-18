import { SharedModule } from '@modules/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './controllers';
import { Post } from './entities';
import { BasePostService, PostService } from './service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), SharedModule],
  controllers: [PostController],
  providers: [BasePostService, PostService],
  exports: [BasePostService, PostService],
})
export class PostModule {}
