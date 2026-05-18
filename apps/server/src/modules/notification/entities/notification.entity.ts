import { Tables } from '@/enums/tables.enum';
import { AbstractEntity } from '@base/entities/base.entity';
import { User } from '@modules/user/entities';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { NotificationType } from '../enums';

@Entity(Tables.Notification)
@Index(['recipientId', 'isRead'])
@Index(['recipientId', 'entityId', 'type']) // For fast aggregated upsert lookup
export class Notification extends AbstractEntity {
  @ApiProperty()
  @Expose()
  @Column({ nullable: false })
  recipientId: string;

  @ApiProperty({ enum: NotificationType, enumName: 'NotificationType' })
  @Expose()
  @Column({ type: 'enum', enum: NotificationType, nullable: false })
  type: NotificationType;

  /**
   * Most recent actors (up to 5 stored), most recent first.
   * e.g. ["userA_id", "userB_id"]
   */
  @ApiProperty({ type: [String] })
  @Expose()
  @Column({ type: 'jsonb', nullable: false, default: [] })
  actors: string[];

  /**
   * Total number of unique actors — may be > actors.length when > 5 people acted.
   * Used to display "UserA, UserB and 3 others"
   */
  @ApiProperty({ default: 0 })
  @Expose()
  @Column({ default: 0 })
  actorCount: number;

  @ApiProperty({ nullable: true })
  @Expose()
  @Column({ type: 'text', nullable: true })
  body?: string;

  @ApiProperty({ nullable: true })
  @Expose()
  @Column({ nullable: true })
  entityId?: string;

  @ApiProperty({ nullable: true })
  @Expose()
  @Column({ nullable: true })
  entityType?: string;

  @ApiProperty({ default: false })
  @Expose()
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty({ nullable: true })
  @Expose()
  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;
}
