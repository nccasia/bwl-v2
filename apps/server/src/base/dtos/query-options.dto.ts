import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { QueryOperator } from '../enums';
import { IsSortQuery } from '../pipes/is-sort-query';

export type Filter = Record<QueryOperator, unknown>;
export class QueryOptionsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @IsSortQuery()
  sort: Record<string, 'desc' | 'asc'>;

  @ApiPropertyOptional()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  filters: Record<string, Filter> = {};
}

export class CursorQueryOptionsDto {
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextCursor: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @IsSortQuery()
  sort: Record<string, 'desc' | 'asc'>;

  @ApiPropertyOptional()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  filters: Record<string, Filter> = {};
}