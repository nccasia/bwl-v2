import { NotificationType } from '../enums';

export interface CreateNotificationInput {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  body?: string;
  entityId?: string;
  entityType?: string;
}
