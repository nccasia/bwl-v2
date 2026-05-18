import { Auth } from '@base/decorators/auth.decorator';
import { UserRequest } from '@base/decorators/user-request.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { AuthorizedContext } from '@modules/auth/types';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFollowDto } from '../dto';
import { FollowService } from '../service';

@ApiTags('Follows')
@Controller('follows')
export class FollowController {
    constructor(private readonly followService: FollowService) { }

    @ApiOperation({ summary: 'Follow a user' })
    @Auth()
    @Post()
    async follow(
        @UserRequest() user: AuthorizedContext,
        @Body() dto: CreateFollowDto,
    ) {
        return this.followService.followAsync(user.userId, dto);
    }

    @ApiOperation({ summary: 'Unfollow a user' })
    @Auth()
    @Delete(':followingId')
    async unfollow(
        @UserRequest() user: AuthorizedContext,
        @Param('followingId') followingId: string,
    ) {
        return this.followService.unfollowAsync(user.userId, followingId);
    }

    @ApiOperation({ summary: 'Get all followers of a user' })
    @Get('followers/:userId')
    async getFollowers(
        @Param('userId') userId: string,
        @Query() query: CursorQueryOptionsDto,
    ) {
        return this.followService.getFollowersAsync(userId, query);
    }

    @ApiOperation({ summary: 'Get all users that a user is following' })
    @Get('following/:userId')
    async getFollowing(
        @Param('userId') userId: string,
        @Query() query: CursorQueryOptionsDto,
    ) {
        return this.followService.getFollowingAsync(userId, query);
    }

    @ApiOperation({ summary: 'Check if current user is following another user' })
    @Auth()
    @Get('is-following/:followingId')
    async isFollowing(
        @UserRequest() user: AuthorizedContext,
        @Param('followingId') followingId: string,
    ) {
        const isFollowing = await this.followService.isFollowingAsync(user.userId, followingId);
        return { isFollowing };
    }
}
