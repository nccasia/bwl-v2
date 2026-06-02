import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { JwtAuthGuard } from '@base/guards/jwt.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { NotificationController } from '../controllers/notification.controller';
import { BaseNotificationDto } from '../dto';
import { NotificationType } from '../enums';
import { NotificationGateway } from '../gateway';
import { NotificationService } from '../service';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: jest.Mocked<NotificationService>;
  let gateway: jest.Mocked<Pick<NotificationGateway, 'createStream'>>;

  const mockUser = { userId: 'user-uuid-1', role: 'admin' } as any;

  const mockNotificationDto: Partial<BaseNotificationDto> = {
    id: 'notif-uuid-1',
    recipientId: 'user-uuid-1',
    type: NotificationType.Comment,
    actors: ['user-uuid-2'],
    actorCount: 1,
    body: 'Test body',
    entityId: 'post-uuid-1',
    entityType: 'post',
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            getNotificationsAsync: jest.fn(),
            getUnreadCountAsync: jest.fn(),
            markAsReadAsync: jest.fn(),
            markAllAsReadAsync: jest.fn(),
          },
        },
        {
          provide: NotificationGateway,
          useValue: {
            createStream: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get(NotificationService);
    gateway = module.get(NotificationGateway);
  });

  describe('getNotifications', () => {
    it('should return paginated notifications', async () => {
      const expectedResult = {
        data: [mockNotificationDto],
        pagination: { limit: 10, hasNextPage: false, nextCursor: undefined },
      };
      service.getNotificationsAsync.mockResolvedValue(expectedResult as never);

      const queryOptions = new CursorQueryOptionsDto();
      queryOptions.limit = 10;

      const result = await controller.getNotifications(mockUser, queryOptions);

      expect(result).toEqual(expectedResult);
      expect(service.getNotificationsAsync).toHaveBeenCalledWith('user-uuid-1', queryOptions);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      service.getUnreadCountAsync.mockResolvedValue({ count: 5 });

      const result = await controller.getUnreadCount(mockUser);

      expect(result).toEqual({ count: 5 });
    });
  });

  describe('sse', () => {
    it('should delegate to gateway createStream', () => {
      const stream$ = of({
        data: { type: 'connected', userId: 'user-uuid-1' },
        type: 'message',
      });
      gateway.createStream.mockReturnValue(stream$);

      const result = controller.sse(mockUser);

      expect(gateway.createStream).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toBe(stream$);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const readDto = new BaseNotificationDto();
      Object.assign(readDto, { ...mockNotificationDto, isRead: true });
      service.markAsReadAsync.mockResolvedValue(readDto);

      const result = await controller.markAsRead('notif-uuid-1', mockUser);

      expect(result.isRead).toBe(true);
      expect(service.markAsReadAsync).toHaveBeenCalledWith('notif-uuid-1', 'user-uuid-1');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      service.markAllAsReadAsync.mockResolvedValue({ updated: 3 });

      const result = await controller.markAllAsRead(mockUser);

      expect(result).toEqual({ updated: 3 });
    });
  });
});
