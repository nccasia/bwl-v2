import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { Post } from '../entities/post.entity';

export class AuthorDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty({ nullable: true }) @Expose() displayName?: string;
  @ApiProperty({ nullable: true }) @Expose() userName?: string;
  @ApiProperty({ nullable: true }) @Expose() avatar?: string;
}

export class BasePostDto extends PickType(Post, [
  'id',
  'authorId',
  'channelId',
  'title',
  'content',
  'status',
  'isPinned',
  'viewCount',
  'images',
  'reactions',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {
  @ApiProperty({ type: () => AuthorDto, nullable: true })
  @Expose()
  @Type(() => AuthorDto)
  author?: AuthorDto;
}

