import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities';

@Injectable()
export class BaseNotificationService {
  constructor(
    @InjectRepository(Notification)
    protected readonly notificationRepository: Repository<Notification>,
  ) {}

  async findNotificationByIdAsync(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException({
        message: 'Notification not found',
        code: 'NOTIFICATION_NOT_FOUND',
      });
    }
    return notification;
  }
}
