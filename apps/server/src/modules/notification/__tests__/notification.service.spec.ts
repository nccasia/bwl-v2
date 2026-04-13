import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities';
import { NotificationType } from '../enums';
import { NotificationGateway } from '../gateway';
import { NotificationService } from '../service/notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: jest.Mocked<Repository<Notification>>;
  let notificationGateway: jest.Mocked<NotificationGateway>;

  const mockNotification = {
    id: 'notif-uuid-1',
    recipientId: 'user-uuid-1',
    type: NotificationType.Comment,
    actors: ['user-uuid-2'],
    actorCount: 1,
    body: 'Test body',
    entityId: 'post-uuid-1',
    entityType: 'post',
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    generateId: jest.fn(),
  } as unknown as Notification;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: NotificationGateway,
          useValue: {
            sendToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get(getRepositoryToken(Notification));
    notificationGateway = module.get(NotificationGateway);
  });

  describe('getNotificationsAsync', () => {
    it('should return cursor-paginated notifications', async () => {
      notificationRepository.find.mockResolvedValue([mockNotification]);

      const queryOptions = new CursorQueryOptionsDto();
      queryOptions.limit = 10;

      const result = await service.getNotificationsAsync('user-uuid-1', queryOptions);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(1);
      expect(result.pagination.hasNextPage).toBe(false);
    });
  });

  describe('getUnreadCountAsync', () => {
    it('should return unread count', async () => {
      notificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCountAsync('user-uuid-1');

      expect(result).toEqual({ count: 5 });
      expect(notificationRepository.count).toHaveBeenCalledWith({
        where: { recipientId: 'user-uuid-1', isRead: false },
      });
    });
  });

  describe('markAsReadAsync', () => {
    it('should mark notification as read', async () => {
      const unreadNotif = { ...mockNotification, isRead: false } as unknown as Notification;
      notificationRepository.findOne.mockResolvedValue(unreadNotif);
      notificationRepository.save.mockResolvedValue({ ...unreadNotif, isRead: true, readAt: new Date() } as unknown as Notification);

      const result = await service.markAsReadAsync('notif-uuid-1', 'user-uuid-1');

      expect(result.isRead).toBe(true);
    });

    it('should throw ForbiddenException if not recipient', async () => {
      notificationRepository.findOne.mockResolvedValue(mockNotification);

      await expect(service.markAsReadAsync('notif-uuid-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAllAsReadAsync', () => {
    it('should update all unread notifications', async () => {
      notificationRepository.update.mockResolvedValue({ affected: 3, raw: [], generatedMaps: [] });

      const result = await service.markAllAsReadAsync('user-uuid-1');

      expect(result).toEqual({ updated: 3 });
    });
  });

  describe('removeNotificationAsync', () => {
    it('should remove actor from notification and decrement count', async () => {
      const existing = {
        ...mockNotification,
        actors: ['user-uuid-2', 'user-uuid-3'],
        actorCount: 2,
      } as unknown as Notification;
      notificationRepository.findOne.mockResolvedValue(existing);
      notificationRepository.save.mockResolvedValue({ ...existing, actors: ['user-uuid-3'], actorCount: 1 } as unknown as Notification);

      await service.removeNotificationAsync({
        actorId: 'user-uuid-2',
        entityId: 'post-uuid-1',
        type: NotificationType.Reaction,
      });

      expect(notificationRepository.save).toHaveBeenCalled();
    });

    it('should delete notification when last actor is removed', async () => {
      const existing = {
        ...mockNotification,
        actors: ['user-uuid-2'],
        actorCount: 1,
      } as unknown as Notification;
      notificationRepository.findOne.mockResolvedValue(existing);
      notificationRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

      await service.removeNotificationAsync({
        actorId: 'user-uuid-2',
        entityId: 'post-uuid-1',
        type: NotificationType.Reaction,
      });

      expect(notificationRepository.delete).toHaveBeenCalledWith(existing.id);
    });

    it('should do nothing if notification does not exist', async () => {
      notificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeNotificationAsync({
          actorId: 'user-uuid-2',
          entityId: 'post-uuid-1',
          type: NotificationType.Reaction,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('createNotificationAsync', () => {
    it('should create new aggregated notification when none exists', async () => {
      notificationRepository.findOne.mockResolvedValue(null); // no existing
      notificationRepository.create.mockReturnValue(mockNotification);
      notificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createNotificationAsync({
        recipientId: 'user-uuid-1',
        actorId: 'user-uuid-2',
        type: NotificationType.Comment,
      });

      expect(result).toBeDefined();
      expect(notificationRepository.create).toHaveBeenCalled();
      expect(notificationGateway.sendToUser).toHaveBeenCalledWith('user-uuid-1', expect.any(Object));
    });

    it('should upsert existing notification — add new actor to front', async () => {
      const existing = {
        ...mockNotification,
        actors: ['user-uuid-3'],
        actorCount: 1,
        isRead: true, // was already read
      } as unknown as Notification;
      notificationRepository.findOne.mockResolvedValue(existing);
      notificationRepository.save.mockResolvedValue({
        ...existing,
        actors: ['user-uuid-2', 'user-uuid-3'],
        actorCount: 2,
        isRead: false, // reset to unread
      } as unknown as Notification);

      const result = await service.createNotificationAsync({
        recipientId: 'user-uuid-1',
        actorId: 'user-uuid-2',
        type: NotificationType.Reaction,
        entityId: 'post-uuid-1',
      });

      expect(result).toBeDefined();
      expect(notificationRepository.create).not.toHaveBeenCalled(); // upsert, not create
      expect(notificationRepository.save).toHaveBeenCalled();
      expect(notificationGateway.sendToUser).toHaveBeenCalledWith('user-uuid-1', expect.any(Object));
    });

    it('should not increment actorCount when same actor reacts again', async () => {
      const existing = {
        ...mockNotification,
        actors: ['user-uuid-2'],
        actorCount: 1,
      } as unknown as Notification;
      notificationRepository.findOne.mockResolvedValue(existing);
      notificationRepository.save.mockResolvedValue(existing);

      await service.createNotificationAsync({
        recipientId: 'user-uuid-1',
        actorId: 'user-uuid-2', // same actor as already in array
        type: NotificationType.Reaction,
        entityId: 'post-uuid-1',
      });

      const savedArg = notificationRepository.save.mock.calls[0][0] as Notification;
      expect(savedArg.actorCount).toBe(1); // not incremented
    });

    it('should return null when actor === recipient (self-notification guard)', async () => {
      const result = await service.createNotificationAsync({
        recipientId: 'user-uuid-1',
        actorId: 'user-uuid-1',
        type: NotificationType.Comment,
      });

      expect(result).toBeNull();
      expect(notificationRepository.findOne).not.toHaveBeenCalled();
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });
  });
});
