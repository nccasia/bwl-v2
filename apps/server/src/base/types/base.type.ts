import { ApiProperty } from '@nestjs/swagger';

export class ResponsePagination {
  @ApiProperty({
    description: 'Total number of pages',
  })
  totalPage: number;

  @ApiProperty({
    description: 'Total number of items',
  })
  total: number;

  @ApiProperty({
    description: 'Size of each page',
  })
  pageSize: number;

  @ApiProperty({
    description: 'Current page number',
  })
  currentPage: number;

  @ApiProperty({
    description: 'Limit of each page',
  })
  limit: number;

  @ApiProperty({
    description: 'Whether there is a next page',
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Next cursor to get the next page',
  })
  nextCursor: string;
}

export class ResponseController<T> {
  @ApiProperty()
  data: T;
}

export class ResponseApp<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty()
  data: T;
}

export class ResponseAppPagination<T> extends ResponseApp<T> {
  @ApiProperty({ type: ResponsePagination })
  pagination: ResponsePagination;
} 