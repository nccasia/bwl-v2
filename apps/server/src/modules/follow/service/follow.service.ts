import { CursorQueryOptionsHelper } from '@base/decorators/query-options.decorator';
import { CursorQueryOptionsDto } from '@base/dtos/query-options.dto';
import { NotificationService } from '@modules/notification/service';
import { NotificationType } from '@modules/notification/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFollowDto } from '../dto';
import { Follow } from '../entities';
import { BaseFollowService } from './base-follow.service';

@Injectable()
export class FollowService extends BaseFollowService {
    constructor(
        @InjectRepository(Follow)
        followRepository: Repository<Follow>,
        private readonly notificationService: NotificationService,
    ) {
        super(followRepository);
    }

    // Follow a user
    async followAsync(followerId: string, dto: CreateFollowDto): Promise<Follow> {
        const { followingId } = dto;

        if (followerId === followingId) {
            throw new BadRequestException({
                message: 'You cannot follow yourself',
                code: 'SELF_FOLLOW_NOT_ALLOWED',
            });
        }

        const existing = await this.findFollowAsync(followerId, followingId);
        if (existing) {
            return existing;
        }
        const follow = this.followRepository.create({ followerId, followingId });
        const saved = await this.followRepository.save(follow);

        this.notificationService.createNotificationAsync({
            recipientId: followingId,
            actorId: followerId,
            type: NotificationType.Follow,
            entityId: followerId,
            entityType: 'user',
        });

        return saved;
    }

    // Unfollow a user
    async unfollowAsync(followerId: string, followingId: string): Promise<{ unfollowed: true }> {
        await this.followRepository.delete({ followerId, followingId });
        return { unfollowed: true };
    }

    // Get all followers of a user (users who follow this user)
    async getFollowersAsync(userId: string, queryOptionsDto: CursorQueryOptionsDto) {
        const cursorHelper = new CursorQueryOptionsHelper(queryOptionsDto, {
            acceptFilterFields: [],
            cursorField: 'id',
            direction: 'DESC',
        });

        const raw = await this.followRepository.find({
            take: cursorHelper.getCursorLimit(),
            where: { followingId: userId, ...cursorHelper.buildWhereConditions() },
            order: cursorHelper.getCursorOrder(),
        });

        const { items, pagination } = cursorHelper.getCursorPagination(raw);
        return { data: items, pagination };
    }

    // Get all users that a user is following
    async getFollowingAsync(userId: string, queryOptionsDto: CursorQueryOptionsDto) {
        const cursorHelper = new CursorQueryOptionsHelper(queryOptionsDto, {
            acceptFilterFields: [],
            cursorField: 'id',
            direction: 'DESC',
        });

        const raw = await this.followRepository.find({
            take: cursorHelper.getCursorLimit(),
            where: { followerId: userId, ...cursorHelper.buildWhereConditions() },
            order: cursorHelper.getCursorOrder(),
        });

        const { items, pagination } = cursorHelper.getCursorPagination(raw);
        return { data: items, pagination };
    }

    // Get follower count for a user
    async getFollowerCountAsync(userId: string): Promise<number> {
        return this.followRepository.count({
            where: { followingId: userId },
        });
    }

    // Get following count for a user
    async getFollowingCountAsync(userId: string): Promise<number> {
        return this.followRepository.count({
            where: { followerId: userId },
        });
    }
}
