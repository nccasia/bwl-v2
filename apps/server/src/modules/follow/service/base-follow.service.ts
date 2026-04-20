import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Follow } from "../entities/follow.entity";

@Injectable()
export class BaseFollowService {
    constructor(
        @InjectRepository(Follow)
        protected readonly followRepository: Repository<Follow>,
    ) { }

    async findFollowByIdAsync(followId: string): Promise<Follow> {
        const follow = await this.followRepository.findOne({
            where: { id: followId },
        });

        if (!follow) {
            throw new NotFoundException({
                message: `Follow with ID ${followId} not found`,
                code: 'FOLLOW_NOT_FOUND',
            });
        }
        return follow;
    }

    async isFollowingAsync(
        followerId: string,
        followingId: string,
    ): Promise<boolean> {
        return this.followRepository.exists({
            where: { followerId, followingId },
        });
    }

    async findFollowAsync(
        followerId: string,
        followingId: string,
    ): Promise<Follow | null> {
        return this.followRepository.findOne({
            where: { followerId, followingId },
        });
    }
}
