import { Tables } from '@/enums/tables.enum';
import { AbstractEntity } from '@base/entities/base.entity';
import { User } from '@modules/user/entities';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReactionTargetType } from '../enums';

@Entity(Tables.Reaction)
@Index(['userId', 'targetId', 'targetType'], { unique: true })
export class Reaction extends AbstractEntity {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  @Column({ nullable: false })
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  @Column({ nullable: false })
  targetId: string;

  @ApiProperty({ enum: ReactionTargetType, enumName: 'ReactionTargetType' })
  @IsEnum(ReactionTargetType)
  @Expose()
  @Column({ type: 'enum', enum: ReactionTargetType, nullable: false })
  targetType: ReactionTargetType;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
