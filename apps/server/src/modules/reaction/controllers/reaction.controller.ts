import { Auth } from '@base/decorators/auth.decorator';
import { ApiResponseType } from '@base/decorators/response-swagger.decorator';
import { UserRequest } from '@base/decorators/user-request.decorator';
import { AuthorizedContext } from '@modules/auth/types';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseReactionDto, LikeReactionDto } from '../dto';
import { ReactionTargetType } from '../enums';
import { ReactionService } from '../service';

@ApiTags('Reactions')
@Controller('reactions')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @ApiOperation({ summary: 'Get all likes for a target (post or comment)' })
  @ApiResponseType(BaseReactionDto, { isArray: true })
  @Get('get-by-target/:targetType/:targetId')
  async getByTarget(
    @Param('targetType') targetType: ReactionTargetType,
    @Param('targetId') targetId: string,
  ) {
    return this.reactionService.getLikesAsync(targetId, targetType);
  }

  @ApiOperation({ summary: 'Like a post or comment' })
  @ApiResponseType(BaseReactionDto)
  @Auth()
  @Post('like')
  async like(
    @UserRequest() user: AuthorizedContext,
    @Body() dto: LikeReactionDto,
  ) {
    return this.reactionService.likeAsync(user.userId, dto);
  }

  @ApiOperation({ summary: 'Unlike a post or comment' })
  @Auth()
  @Delete('unlike/:targetType/:targetId')
  async unlike(
    @Param('targetType') targetType: ReactionTargetType,
    @Param('targetId') targetId: string,
    @UserRequest() user: AuthorizedContext,
  ) {
    return this.reactionService.unlikeAsync(user.userId, targetId, targetType);
  }
}
