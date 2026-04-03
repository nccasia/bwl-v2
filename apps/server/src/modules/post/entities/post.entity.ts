import { Tables } from '@/enums/tables.enum';
import { AbstractEntity } from '@base/entities/base.entity';
import { User } from '@modules/user/entities';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PostStatus } from '../enums';

@Entity(Tables.Post)
export class Post extends AbstractEntity {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Expose()
    @Column({ nullable: false })
    authorId: string;

    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsString()
    @Expose()
    @Column({ nullable: true })
    channelId?: string;

    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsString()
    @Expose()
    @Column({ nullable: true })
    title?: string;

    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsString()
    @Expose()
    @Column({ type: 'text', nullable: true })
    content?: string;

    @ApiProperty({ enum: PostStatus, enumName: 'PostStatus', default: PostStatus.Published })
    @IsEnum(PostStatus)
    @Expose()
    @Column({ type: 'enum', enum: PostStatus, default: PostStatus.Published })
    status: PostStatus;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    @Expose()
    @Column({ default: false })
    isPinned: boolean;

    @ApiProperty({ default: 0 })
    @Expose()
    @Column({ default: 0 })
    viewCount: number;

    @ApiProperty({ type: [String], nullable: true })
    @IsOptional()
    @Expose()
    @Column({ type: 'text', array: true, nullable: true, default: [] })
    images: string[];

    @ApiProperty({ nullable: true })
    @IsOptional()
    @Expose()
    @Column({ type: 'jsonb', nullable: true, default: {} })
    reactions: Record<string, string[]>;

    @ApiProperty({ nullable: true })
    @IsOptional()
    @IsString()
    @Expose()
    @Column({ nullable: true, unique: true })
    mezonMessageId?: string;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author: User;
}
