type OperatorQuery = 'eq' | 'neq' | 'gte' | 'gt' | 'lte' | 'lt' | 'in' | 'nin';
export type Filter = Partial<Record<OperatorQuery, string | number | boolean | string[] | number[] | boolean[]>>;

export interface ApiResponse<T> {
    data?: T
    pagination?: {
        currentPage: number
        pageSize: number
        total: number
        totalPage: number
        nextCursor?: string
    }
    statusCode: number
    isSuccess: boolean
    message?: string | string[]
    errorCode?: string
    timestamp?: string
    path?: string
}

export interface BaseEntity {
    id: string
    createdAt: string
    updatedAt: string
}

export interface QueryParams {
    page?: number
    limit?: number
    nextCursor?: string
    search?: string
    sort?: Record<string, 'desc' | 'asc'>;
    filters?: Record<string, Filter>
    getAll?: boolean
}

export interface FileUploadResponseDto {
    uploadUrl: string;
    accessUrl: string;
}