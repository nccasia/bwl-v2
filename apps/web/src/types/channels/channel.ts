export interface Channel {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    type: string;
    mezonChannelId: string;
    postCount?: number;
}

export interface ChannelResponse {
    data: Channel[];
    pagination: {
        totalPage: number,
        total: number,
        pageSize: number,
        currentPage: number,
        limit: number,
        hasNextPage: boolean,
        nextCursor: string,
    }
}
