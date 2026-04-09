import { SharedModule } from '@modules/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionController } from './controllers';
import { Reaction } from './entities';
import { BaseReactionService, ReactionService } from './service';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction]), SharedModule],
  controllers: [ReactionController],
  providers: [BaseReactionService, ReactionService],
  exports: [BaseReactionService, ReactionService],
})
export class ReactionModule {}
