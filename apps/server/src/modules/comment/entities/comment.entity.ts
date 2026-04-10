import { Tables } from '@/enums/tables.enum';
import { AbstractEntity } from '@base/entities/base.entity';
import { Post } from '@modules/post/entities';
import { User } from '@modules/user/entities';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity(Tables.Comment)
export class Comment extends AbstractEntity {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  @Column({ nullable: false })
  postId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  @Column({ nullable: false })
  authorId: string;

  @ApiProperty({ nullable: true, description: 'NULL = top-level comment, non-null = reply' })
  @IsOptional()
  @IsString()
  @Expose()
  @Column({ nullable: true })
  parentId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Expose()
  @Column({ type: 'text', nullable: false })
  content: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  @Expose()
  @Column({ default: false })
  isEdited: boolean;

  @ManyToOne(() => Post, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Comment;
}
