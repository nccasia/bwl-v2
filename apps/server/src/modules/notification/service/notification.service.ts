import { CursorQueryOptionsHelper } from '@base/decorators/query-options.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { BaseNotificationDto } from '../dto';
import { Notification } from '../entities';
import { NotificationType } from '../enums';
import { NotificationGateway } from '../gateway';
import { BaseNotificationService } from './base-notification.service';

export interface CreateNotificationInput {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  body?: string;
  entityId?: string;
  entityType?: string;
}

/** Max number of recent actor IDs stored in the actors array */
const MAX_STORED_ACTORS = 5;

@Injectable()
export class NotificationService extends BaseNotificationService {
  constructor(
    @InjectRepository(Notification)
    notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {
    super(notificationRepository);
  }

  async getNotificationsAsync(userId: string, queryOptionsDto: CursorQueryOptionsDto) {
    const cursorHelper = new CursorQueryOptionsHelper(queryOptionsDto, {
      cursorField: 'id',
      direction: 'DESC',
    });

    const rawNotifications = await this.notificationRepository.find({
      take: cursorHelper.getCursorLimit(),
      where: { recipientId: userId, ...cursorHelper.buildWhereConditions() },
      order: cursorHelper.getCursorOrder(),
    });

    const { items, pagination } = cursorHelper.getCursorPagination(rawNotifications);
    const data = items.map((n) =>
      plainToInstance(BaseNotificationDto, n, { excludeExtraneousValues: true }),
    );

    return { data, pagination };
  }

  async getUnreadCountAsync(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });
    return { count };
  }

  async markAsReadAsync(notificationId: string, userId: string): Promise<BaseNotificationDto> {
    const notification = await this.findNotificationByIdAsync(notificationId);
    if (notification.recipientId !== userId) {
      throw new ForbiddenException({
        message: 'You are not the recipient of this notification',
        code: 'NOTIFICATION_FORBIDDEN',
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    const updated = await this.notificationRepository.save(notification);
    return plainToInstance(BaseNotificationDto, updated, { excludeExtraneousValues: true });
  }

  async markAllAsReadAsync(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { updated: result.affected ?? 0 };
  }

  /**
   * Remove an actor from an aggregated notification (e.g. on unlike).
   * If no actors remain, deletes the notification entirely.
   */
  async removeNotificationAsync(params: {
    actorId: string;
    entityId: string;
    type: NotificationType;
  }): Promise<void> {
    const existing = await this.notificationRepository.findOne({
      where: { entityId: params.entityId, type: params.type },
    });

    if (!existing) return;

    const newActors = existing.actors.filter((id) => id !== params.actorId);

    if (newActors.length === 0) {
      await this.notificationRepository.delete(existing.id);
    } else {
      existing.actors = newActors;
      existing.actorCount = Math.max(0, existing.actorCount - 1);
      await this.notificationRepository.save(existing);
    }
  }

  /**
   * Create or aggregate a notification.
   *
   * - If a notification for (recipientId, entityId, type) already exists:
   *   → add the new actor to the front, increment actorCount, mark unread, push SSE.
   * - Otherwise: create a new aggregated notification with actorCount = 1.
   */
  async createNotificationAsync(input: CreateNotificationInput): Promise<BaseNotificationDto> {
    // Don't notify yourself
    if (input.actorId === input.recipientId) return null;

    const existing = await this.notificationRepository.findOne({
      where: {
        recipientId: input.recipientId,
        entityId: input.entityId,
        type: input.type,
      },
    });

    let saved: Notification;

    if (existing) {
      const alreadyIn = existing.actors.includes(input.actorId);

      // Move actor to front (most recent), keep up to MAX_STORED_ACTORS
      existing.actors = [
        input.actorId,
        ...existing.actors.filter((id) => id !== input.actorId),
      ].slice(0, MAX_STORED_ACTORS);

      existing.actorCount = alreadyIn ? existing.actorCount : existing.actorCount + 1;
      existing.isRead = false;       // reset to unread when new activity arrives
      existing.readAt = null;
      existing.updatedAt = new Date();
      if (input.body) existing.body = input.body; // update with latest body (e.g. newest comment)

      saved = await this.notificationRepository.save(existing);
    } else {
      const notification = this.notificationRepository.create({
        recipientId: input.recipientId,
        type: input.type,
        actors: [input.actorId],
        actorCount: 1,
        body: input.body,
        entityId: input.entityId,
        entityType: input.entityType,
      });
      saved = await this.notificationRepository.save(notification);
    }

    const dto = plainToInstance(BaseNotificationDto, saved, { excludeExtraneousValues: true });
    this.notificationGateway.sendToUser(input.recipientId, dto);
    return dto;
  }
}
