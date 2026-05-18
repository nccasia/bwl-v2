import { SharedModule } from '@modules/shared/shared.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities';
import { BaseFollowService, FollowService } from './service';
import { FollowController } from './controllers';

@Module({
    imports: [TypeOrmModule.forFeature([Follow]), SharedModule, NotificationModule],
    controllers: [FollowController],
    providers: [BaseFollowService, FollowService],
    exports: [BaseFollowService, FollowService],
})
export class FollowModule { }
