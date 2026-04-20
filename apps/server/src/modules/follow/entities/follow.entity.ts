import { AbstractEntity } from '@/base/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity('follows')
@Unique(['followerId', 'followingId'])
@Index(['followerId'])
@Index(['followingId'])
export class Follow extends AbstractEntity {
    @ApiProperty({ description: 'ID of the user who is following' })
    @IsNotEmpty()
    @Expose()
    @IsString()
    @Column()
    followerId: string;

    @ApiProperty({ description: 'ID of the user being followed' })
    @IsNotEmpty()
    @Expose()
    @IsString()
    @Column()
    followingId: string;
}