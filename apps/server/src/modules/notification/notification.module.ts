import { SharedModule } from '@modules/shared/shared.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './controllers';
import { Notification } from './entities';
import { NotificationGateway } from './gateway';
import { NotificationService } from './service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), SharedModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule { }
