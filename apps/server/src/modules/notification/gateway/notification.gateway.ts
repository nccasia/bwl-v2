import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { BaseNotificationDto } from '../dto';


@Injectable()
export class NotificationGateway {
  private readonly logger = new Logger(NotificationGateway.name);
  private readonly clients = new Map<string, Subject<MessageEvent>>();

  addClient(userId: string): Observable<MessageEvent> {
    // Remove existing connection if any (one connection per user)
    this.removeClient(userId);

    const subject = new Subject<MessageEvent>();
    this.clients.set(userId, subject);
    this.logger.log(`SSE client connected: ${userId} (total: ${this.clients.size})`);

    return subject.asObservable();
  }

  removeClient(userId: string): void {
    const existing = this.clients.get(userId);
    if (existing) {
      existing.complete();
      this.clients.delete(userId);
      this.logger.log(`SSE client disconnected: ${userId} (total: ${this.clients.size})`);
    }
  }

  sendToUser(userId: string, notification: BaseNotificationDto): void {
    const subject = this.clients.get(userId);
    if (subject) {
      subject.next({
        data: JSON.stringify(notification),
        type: 'notification',
      } as MessageEvent);
    }
  }
}
