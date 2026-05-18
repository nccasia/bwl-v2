import { ApiQueryOptions } from '@base/decorators/api-query-options.decorator';
import { Auth } from '@base/decorators/auth.decorator';
import { QueryOptions } from '@base/decorators/query-options.decorator';
import { ApiResponseType } from '@base/decorators/response-swagger.decorator';
import { UserRequest } from '@base/decorators/user-request.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { AuthorizedContext } from '@modules/auth/types';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCommentDto, CreateCommentDto, UpdateCommentDto } from '../dto';
import { CommentService } from '../service';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: 'Get comments for a post' })
  @ApiQueryOptions()
  @ApiResponseType(BaseCommentDto, { isArray: true, hasPagination: true })
  @Get('get-by-post/:postId')
  async getByPost(
    @Param('postId') postId: string,
    @QueryOptions() queryOptions: CursorQueryOptionsDto,
  ) {
    return this.commentService.getCommentsByPostAsync(postId, queryOptions);
  }

  @ApiOperation({ summary: 'Get replies to a comment' })
  @ApiQueryOptions()
  @ApiResponseType(BaseCommentDto, { isArray: true, hasPagination: true })
  @Get('get-replies/:commentId')
  async getReplies(
    @Param('commentId') commentId: string,
    @QueryOptions() queryOptions: CursorQueryOptionsDto,
  ) {
    return this.commentService.getRepliesByCommentAsync(commentId, queryOptions);
  }

  @ApiOperation({ summary: 'Create a comment or reply' })
  @ApiResponseType(BaseCommentDto)
  @Auth()
  @Post('create-comment')
  async createComment(
    @UserRequest() user: AuthorizedContext,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.createCommentAsync(user.userId, dto);
  }

  @ApiOperation({ summary: 'Update a comment (author only)' })
  @ApiResponseType(BaseCommentDto)
  @Auth()
  @Put('update-comment/:commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @UserRequest() user: AuthorizedContext,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentService.updateCommentAsync(commentId, user.userId, dto);
  }

  @ApiOperation({ summary: 'Delete a comment (author only)' })
  @Auth()
  @Delete('delete-comment/:commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @UserRequest() user: AuthorizedContext,
  ) {
    return this.commentService.deleteCommentAsync(commentId, user.userId);
  }
}
