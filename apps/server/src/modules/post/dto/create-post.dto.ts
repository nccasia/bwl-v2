import { ApiProperty, PickType } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUrl } from 'class-validator';
import { Post } from '../entities/post.entity';

export class CreatePostDto extends PickType(Post, [
  'channelId',
  'title',
  'content',
  'status',
  'isPinned',
]) {
  @ApiProperty({
    description: 'List of image URLs. At least one image is required.',
    example: ['https://cdn.example.com/post-images/photo-123456789.jpg'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one image is required' })
  @IsUrl({}, { each: true, message: 'Each image must be a valid URL' })
  images: string[];
}

