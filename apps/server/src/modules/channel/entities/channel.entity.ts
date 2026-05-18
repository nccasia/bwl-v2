import { Tables } from '@/enums/tables.enum';
import { AbstractEntity } from '@base/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { ChannelType } from '../enums';

@Entity(Tables.Channel)
export class Channel extends AbstractEntity {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  @Column({ nullable: false })
  name: string;

  @ApiProperty({ enum: ChannelType, enumName: 'ChannelType', default: ChannelType.Public })
  @IsEnum(ChannelType)
  @Expose()
  @Column({ type: 'enum', enum: ChannelType, default: ChannelType.Public })
  type: ChannelType;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  @Expose()
  @Column({ name: 'mezon_channel_id', nullable: true, unique: true })
  mezonChannelId?: string;
}
