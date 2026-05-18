import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities';

@Injectable()
export class BasePostService {
  constructor(
    @InjectRepository(Post)
    protected readonly postRepository: Repository<Post>,
  ) {}

  /**
   * Find a post by ID.
   * @throws NotFoundException if the post does not exist.
   */
  async findPostByIdAsync(postId: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException({
        message: `Post with ID ${postId} not found`,
        code: 'POST_NOT_FOUND',
      });
    }

    return post;
  }

  /**
   * Check if the given user is the author of the post.
   * @throws NotFoundException if the post does not exist.
   */
  async assertAuthorAsync(postId: string, userId: string): Promise<Post> {
    const post = await this.findPostByIdAsync(postId);

    if (post.authorId !== userId) {
      throw new ForbiddenException({
        message: 'You are not the author of this post',
        code: 'POST_FORBIDDEN',
      });
    }

    return post;
  }
}
