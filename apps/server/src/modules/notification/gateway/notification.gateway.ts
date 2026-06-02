import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { interval, merge, Observable, of, Subject } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BaseNotificationDto } from '../dto';


@Injectable()
export class NotificationGateway {
  private readonly logger = new Logger(NotificationGateway.name);
  private readonly clients = new Map<string, Subject<MessageEvent>>();
  
  createStream(userId: string): Observable<MessageEvent> {
    const SSE_HEARTBEAT_MS = 25_000;
    const notifications$ = this.addClient(userId);
    const heartbeat$ = interval(SSE_HEARTBEAT_MS).pipe(
      map(
        (): MessageEvent => ({
          data: { type: 'heartbeat' },
          type: 'message',
        }),
      ),
    );

    return merge(
      of({
        data: { type: 'connected', userId },
        type: 'message',
      }),
      notifications$,
      heartbeat$,
    ).pipe(
      finalize(() => {
        this.removeClient(userId);
      }),
    );
  }

  addClient(userId: string): Observable<MessageEvent> {
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
        data: notification,
        type: 'notification',
      });
    }
  }

  /**
   * Broadcast a realtime event to all connected SSE clients.
   * Used for post like/comment count updates.
   */
  broadcast(eventType: string, payload: Record<string, unknown>): void {
    const message: MessageEvent = {
      data: { type: eventType, ...payload },
      type: 'message',
    };

    this.clients.forEach((subject) => {
      subject.next(message);
    });
  }
}
