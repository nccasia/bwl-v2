import { NotificationType } from '../enums';
import { NotificationGateway } from '../gateway/notification.gateway';
import { BaseNotificationDto } from '../dto';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;

  beforeEach(() => {
    gateway = new NotificationGateway();
  });

  describe('addClient', () => {
    it('should add a client and return an observable', () => {
      const observable = gateway.addClient('user-1');

      expect(observable).toBeDefined();
      expect(observable.subscribe).toBeDefined();
    });

    it('should replace existing connection when adding same user', () => {
      const first = gateway.addClient('user-1');
      let firstCompleted = false;
      first.subscribe({ complete: () => { firstCompleted = true; } });

      gateway.addClient('user-1');

      expect(firstCompleted).toBe(true);
    });
  });

  describe('removeClient', () => {
    it('should remove client and complete observable', () => {
      const observable = gateway.addClient('user-1');
      let completed = false;
      observable.subscribe({ complete: () => { completed = true; } });

      gateway.removeClient('user-1');

      expect(completed).toBe(true);
    });

    it('should do nothing if client does not exist', () => {
      expect(() => gateway.removeClient('nonexistent')).not.toThrow();
    });
  });

  describe('sendToUser', () => {
    it('should push event to connected client', (done) => {
      const observable = gateway.addClient('user-1');

      const mockNotification: Partial<BaseNotificationDto> = {
        id: 'notif-1',
        type: NotificationType.Comment,
        actors: ['user-uuid-2'],
        actorCount: 1,
      };

      observable.subscribe((event) => {
        expect(event.type).toBe('notification');
        expect(event.data).toBe(JSON.stringify(mockNotification));
        done();
      });

      gateway.sendToUser('user-1', mockNotification as BaseNotificationDto);
    });

    it('should do nothing if user is not connected', () => {
      const mockNotification = { id: 'notif-1', actors: [], actorCount: 0 } as unknown as BaseNotificationDto;

      expect(() => gateway.sendToUser('nonexistent', mockNotification)).not.toThrow();
    });
  });
});
