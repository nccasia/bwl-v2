import { ApiQueryOptions } from '@base/decorators/api-query-options.decorator';
import { Auth } from '@base/decorators/auth.decorator';
import { QueryOptions } from '@base/decorators/query-options.decorator';
import { ApiResponseType } from '@base/decorators/response-swagger.decorator';
import { UserRequest } from '@base/decorators/user-request.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { AuthorizedContext } from '@modules/auth/types';
import { Controller, Get, MessageEvent, Param, Patch, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { BaseNotificationDto } from '../dto';
import { NotificationGateway } from '../gateway';
import { NotificationService } from '../service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiQueryOptions()
  @ApiResponseType(BaseNotificationDto, { isArray: true, hasPagination: true })
  @Auth()
  @Get()
  async getNotifications(
    @UserRequest() user: AuthorizedContext,
    @QueryOptions() queryOptions: CursorQueryOptionsDto,
  ) {
    return this.notificationService.getNotificationsAsync(user.userId, queryOptions);
  }

  @ApiOperation({ summary: 'Get unread notification count' })
  @Auth()
  @Get('unread-count')
  async getUnreadCount(@UserRequest() user: AuthorizedContext) {
    return this.notificationService.getUnreadCountAsync(user.userId);
  }

  @ApiOperation({
    summary: 'SSE stream for realtime notifications',
    description: 'Connect with Authorization bearer token or query param token',
  })
  @Auth()
  @Sse('sse')
  sse(@UserRequest() user: AuthorizedContext): Observable<MessageEvent> {
    return this.notificationGateway.createStream(user.userId);
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponseType(BaseNotificationDto)
  @Auth()
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @UserRequest() user: AuthorizedContext,
  ) {
    return this.notificationService.markAsReadAsync(id, user.userId);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @Auth()
  @Patch('read-all')
  async markAllAsRead(@UserRequest() user: AuthorizedContext) {
    return this.notificationService.markAllAsReadAsync(user.userId);
  }
}
