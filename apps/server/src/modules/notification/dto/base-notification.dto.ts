import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { NotificationType } from '../enums';

export class BaseNotificationDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() recipientId: string;
  @ApiProperty({ enum: NotificationType, enumName: 'NotificationType' }) @Expose() type: NotificationType;

  @ApiProperty({
    type: [String],
    description: 'Most recent actor IDs (up to 5), most recent first',
  })
  @Expose()
  actors: string[];

  @ApiProperty({ description: 'Total number of unique actors' })
  @Expose()
  actorCount: number;

  @ApiProperty({ nullable: true }) @Expose() body?: string;
  @ApiProperty({ nullable: true }) @Expose() entityId?: string;
  @ApiProperty({ nullable: true }) @Expose() entityType?: string;
  @ApiProperty({ default: false }) @Expose() isRead: boolean;
  @ApiProperty({ nullable: true }) @Expose() readAt?: Date;
  @ApiProperty() @Expose() createdAt: Date;
}
