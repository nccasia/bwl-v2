import { ApiQueryOptions } from '@base/decorators/api-query-options.decorator';
import { Auth } from '@base/decorators/auth.decorator';
import { QueryOptions } from '@base/decorators/query-options.decorator';
import { ApiResponseType } from '@base/decorators/response-swagger.decorator';
import { UserRequest } from '@base/decorators/user-request.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { AuthorizedContext } from '@modules/auth/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BasePostDto, CreatePostDto, UpdatePostDto } from '../dto';
import { PostService } from '../service';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @ApiOperation({ summary: 'Get all posts with pagination' })
  @ApiQueryOptions()
  @ApiResponseType(BasePostDto, { isArray: true, hasPagination: true })
  @Get('get-posts')
  async getPosts(
    @QueryOptions() queryOptions: CursorQueryOptionsDto
  ) {
    return this.postService.getPostsAsync(queryOptions);
  }

  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiResponseType(BasePostDto)
  @Get('get-post/:postId')
  async getPostById(
    @Param('postId') postId: string
  ) {
    await this.postService.incrementViewCountAsync(postId);
    return this.postService.getPostByIdAsync(postId);
  }

  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponseType(BasePostDto)
  @Auth()
  @Post('create-post')
  async createPost(
    @UserRequest() user: AuthorizedContext,
    @Body() dto: CreatePostDto,
  ) {
    return this.postService.createPostAsync(user.userId, dto);
  }

  @ApiOperation({ summary: 'Update a post (author only)' })
  @ApiResponseType(BasePostDto)
  @Auth()
  @Put('update-post/:postId')
  async updatePost(
    @Param('postId') postId: string,
    @UserRequest() user: AuthorizedContext,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.updatePostAsync(postId, user.userId, dto);
  }

  @ApiOperation({ summary: 'Delete a post (author only)' })
  @Auth()
  @Delete('delete-post/:postId')
  async deletePost(
    @Param('postId') postId: string,
    @UserRequest() user: AuthorizedContext,
  ) {
    return this.postService.deletePostAsync(postId, user.userId);
  }

  @ApiOperation({ summary: 'Pin or unpin a post (author only)' })
  @ApiResponseType(BasePostDto)
  @Auth()
  @Patch('toggle-pin/:postId')
  async togglePin(
    @Param('postId') postId: string,
    @UserRequest() user: AuthorizedContext,
  ) {
    return this.postService.togglePinAsync(postId, user.userId);
  }
}
