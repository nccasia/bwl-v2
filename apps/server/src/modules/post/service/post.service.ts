import { QueryOptionsHelper } from '@base/decorators/query-options.decorator';
import { QueryOptionsDto } from '@base/dtos/query-options.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { BasePostDto, CreatePostDto, UpdatePostDto } from '../dto';
import { Post } from '../entities';
import { BasePostService } from './base-post.service';

@Injectable()
export class PostService extends BasePostService {
  constructor(
    @InjectRepository(Post)
    postRepository: Repository<Post>,
  ) {
    super(postRepository);
  }

  /**
   * Get all posts with offset pagination.
   */
  async getPostsAsync(queryOptionsDto: QueryOptionsDto) {
    const { getPagination, skip, take, filters } = new QueryOptionsHelper(queryOptionsDto, {
      acceptFilterFields: ['authorId', 'channelId', 'status']
    });

    const [rawPosts, count] = await this.postRepository.findAndCount({
      skip,
      take,
      where: filters,
      relations: { author: true },
      order: { isPinned: 'DESC', createdAt: 'DESC' },
    });

    const posts = rawPosts.map((post) =>
      plainToInstance(BasePostDto, post, { excludeExtraneousValues: true }),
    );
    return { data: posts, pagination: getPagination({ count, total: count }) };
  }

  /**
   * Get a single post by ID.
   */
  async getPostByIdAsync(postId: string): Promise<BasePostDto> {
    const post = await this.findPostByIdAsync(postId);
    return plainToInstance(BasePostDto, post, { excludeExtraneousValues: true });
  }

  /**
   * Create a new post. authorId is injected from JWT context, not from client.
   */
  async createPostAsync(authorId: string, dto: CreatePostDto): Promise<BasePostDto> {
    const newPost = this.postRepository.create({ ...dto, authorId });
    const saved = await this.postRepository.save(newPost);
    const post = await this.findPostByIdAsync(saved.id);
    return plainToInstance(BasePostDto, post, { excludeExtraneousValues: true });
  }

  /**
   * Update a post. Only the author can update their own post.
   */
  async updatePostAsync(
    postId: string,
    userId: string,
    dto: UpdatePostDto,
  ): Promise<BasePostDto> {
    const post = await this.assertAuthorAsync(postId, userId);
    const updated = await this.postRepository.save({ ...post, ...dto });
    return plainToInstance(BasePostDto, updated, { excludeExtraneousValues: true });
  }

  /**
   * Soft-delete a post. Only the author can delete their own post.
   */
  async deletePostAsync(postId: string, userId: string): Promise<{ postId: string }> {
    const post = await this.assertAuthorAsync(postId, userId);
    await this.postRepository.softRemove(post);
    return { postId: post.id };
  }

  /**
   * Pin or unpin a post. Only the author can pin their own post.
   */
  async togglePinAsync(postId: string, userId: string): Promise<BasePostDto> {
    const post = await this.assertAuthorAsync(postId, userId);
    const newPinState = !post.isPinned;
    if (newPinState) {
      if (post.channelId) {
        await this.postRepository.update(
          { channelId: post.channelId, isPinned: true },
          { isPinned: false },
        );
      } else {
        await this.postRepository.update(
          { authorId: post.authorId, isPinned: true },
          { isPinned: false },
        );
      }
    }
    const updated = await this.postRepository.save({ ...post, isPinned: newPinState });
    return plainToInstance(BasePostDto, updated, { excludeExtraneousValues: true });
  }

  /**
   * Increment view count (called when a post is opened).
   */
  async incrementViewCountAsync(postId: string): Promise<void> {
    await this.postRepository.increment({ id: postId }, 'viewCount', 1);
  }
}
